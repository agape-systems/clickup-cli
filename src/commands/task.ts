import * as fs from 'fs';
import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpTask, ClickUpTasksResponse, TaskCreateOptions, TaskUpdateOptions } from '../types';
import { waitForCustomId, outputJson, outputPretty } from '../utils';

// List tasks in a list or all accessible tasks
export const listTasksCommand = new Command('ls')
  .argument('[listId]', 'List ID to get tasks from (optional)')
  .option('--json', 'Output result as JSON')
  .description('List tasks in a list or all accessible tasks')
  .action(async (listId: string | undefined, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Fetching tasks${listId ? ` for list ${listId}` : '...'}`);
    }
    
    try {
      const path = listId 
        ? `/api/v2/list/${listId}/task`
        : '/api/v2/task';
        
      const result = await makeApiRequest<ClickUpTasksResponse>('GET', path);
      
      if (options.json) {
        outputJson(result);
      } else {
        if (result.tasks && result.tasks.length > 0) {
          console.log(`✅ Found ${result.tasks.length} task(s):`);
          result.tasks.forEach(task => {
            console.log(`  ${task.id} - ${task.name} [${task.status.status}]`);
            if (task.custom_id) {
              console.log(`    Custom ID: ${task.custom_id}`);
            }
            if (task.assignees && task.assignees.length > 0) {
              console.log(`    Assignees: ${task.assignees.map((a: any) => a.username || a.email).join(', ')}`);
            }
            if (task.due_date) {
              console.log(`    Due: ${new Date(task.due_date).toLocaleDateString()}`);
            }
            console.log(`    URL: ${task.url}`);
            console.log('');
          });
        } else {
          console.log('✅ No tasks found');
        }
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error listing tasks:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Create task command
export const createTaskCommand = new Command('create')
  .requiredOption('--list-id <listId>', 'List ID to create task in')
  .argument('<taskName>', 'Task name')
  .option('--description <description>', 'Plain text description (use --markdown for formatted content)')
  .option('--markdown <content>', 'Markdown formatted description (recommended for rich content)')
  .option('--markdown-file <filePath>', 'Read markdown description from file (recommended for long content)')
  .option('--assignees <user1,user2>', 'Comma-separated user IDs')
  .option('--priority <priority>', 'Task priority (low, normal, high, urgent)')
  .option('--due-date <date>', 'Due date (YYYY-MM-DD)')
  .option('--status <status>', 'Custom status')
  .option('--tags <tag1,tag2>', 'Comma-separated tags')
  .option('--json', 'Output result as JSON')
  .description('Create a new task. Use --markdown or --markdown-file for rich formatted content.')
  .action(async (taskName: string, options: TaskCreateOptions & { listId: string; json?: boolean; markdown?: string; markdownFile?: string }) => {
    if (!options.json) {
      console.log(`🔄 Creating ClickUp task: ${taskName}`);
    }
    
    try {
      const payload: any = {
        name: taskName
      };
      
      // Handle description with priority for markdown
      if (options.markdown || options.markdownFile) {
        let markdownContent: string;
        
        if (options.markdownFile) {
          try {
            markdownContent = fs.readFileSync(options.markdownFile, 'utf8');
          } catch (error) {
            if (options.json) {
              outputJson({ error: `Error reading markdown file "${options.markdownFile}": ${(error as Error).message}` });
            } else {
              console.error(`❌ Error reading markdown file "${options.markdownFile}":`, (error as Error).message);
            }
            process.exit(1);
          }
        } else if (options.markdown) {
          markdownContent = options.markdown;
        } else {
          if (options.json) {
            outputJson({ error: 'Markdown content is required when using --markdown option' });
          } else {
            console.error('❌ Error: Markdown content is required when using --markdown option');
          }
          process.exit(1);
        }
        
        payload.description = markdownContent;
      } else if (options.description) {
        payload.description = options.description;
      }
      
      // Only add priority if explicitly specified
      if (options.priority) {
        switch (options.priority.toLowerCase()) {
          case 'urgent':
            payload.priority = 4;
            break;
          case 'high':
            payload.priority = 3;
            break;
          case 'normal':
            payload.priority = 2;
            break;
          case 'low':
            payload.priority = 1;
            break;
          default:
            // Try to use as-is (might already be numeric)
            payload.priority = parseInt(options.priority) || 2;
        }
      }
      
      // Only add fields if they have values
      if (options.assignees && options.assignees.trim()) {
        payload.assignees = options.assignees.split(',').map(id => id.trim());
      }
      
      if (options.status && options.status.trim()) {
        payload.status = options.status;
      }
      
      if (options.tags && options.tags.trim()) {
        payload.tags = options.tags.split(',').map(tag => tag.trim());
      }
      
      // Add due date if provided
      if (options.due_date) {
        payload.due_date = options.due_date;
      }
      
      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });
      
      const result = await makeApiRequest<ClickUpTask>('POST', `/api/v2/list/${options.listId}/task`, payload);
      
      // Try to get custom_id with retry logic
      const taskWithCustomId = await waitForCustomId(result.id);
      
      if (options.json) {
        outputJson(taskWithCustomId);
      } else {
        console.log('✅ Task created successfully!');
        console.log(`Task ID: ${taskWithCustomId.id}`);
        if (taskWithCustomId.custom_id) {
          console.log(`Custom ID: ${taskWithCustomId.custom_id}`);
        }
        console.log(`Task Name: ${taskWithCustomId.name}`);
        console.log(`URL: ${taskWithCustomId.url}`);
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error creating task:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Get a single task (default command)
export const getTaskCommand = new Command('<taskId>')
  .argument('<taskId>', 'Task ID to view')
  .option('--json', 'Output result as JSON')
  .description('Get detailed information about a task')
  .action(async (taskId: string, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Fetching task: ${taskId}`);
    }
    
    try {
      const result = await makeApiRequest<ClickUpTask>('GET', `/api/v2/task/${taskId}`);
      
      if (options.json) {
        outputJson(result);
      } else {
        console.log('✅ Task Details:');
        console.log(`  ID: ${result.id}`);
        if (result.custom_id) {
          console.log(`  Custom ID: ${result.custom_id}`);
        }
        console.log(`  Name: ${result.name}`);
        console.log(`  Status: ${result.status.status}`);
        console.log(`  Priority: ${result.priority?.priority || 'None'}`);
        console.log(`  Created: ${new Date(result.date_created).toLocaleString()}`);
        console.log(`  Updated: ${new Date(result.date_updated).toLocaleString()}`);
        
        if (result.description) {
          console.log(`  Description: ${result.description}`);
        }
        
        if (result.assignees && result.assignees.length > 0) {
          console.log(`  Assignees: ${result.assignees.map((a: any) => a.username || a.email).join(', ')}`);
        }
        
        if (result.due_date) {
          console.log(`  Due Date: ${new Date(result.due_date).toLocaleString()}`);
        }
        
        if (result.tags && result.tags.length > 0) {
          console.log(`  Tags: ${result.tags.join(', ')}`);
        }
        
        console.log(`  URL: ${result.url}`);
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error getting task:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Update task command (nested under get)
export const updateTaskCommand = new Command('update')
  .argument('<taskId>', 'Task ID to update')
  .argument('<property>', 'Property name to update')
  .argument('<value>', 'New value or --file <filePath>')
  .option('--file <filePath>', 'Read value from file')
  .option('--json', 'Output result as JSON')
  .description('Update a task property')
  .action(async (taskId: string, propName: string, valueOrFlag: string, options: { file?: string; json?: boolean }, command: Command) => {
    if (!options.json) {
      console.log(`🔄 Updating task ${taskId} property: ${propName}`);
    }
    
    try {
      let updateValue: string;
      
      if (options.file) {
        try {
          updateValue = fs.readFileSync(options.file, 'utf8');
        } catch (error) {
          if (options.json) {
            outputJson({ error: `Error reading file "${options.file}": ${(error as Error).message}` });
          } else {
            console.error(`❌ Error reading file "${options.file}":`, (error as Error).message);
          }
          process.exit(1);
        }
      } else {
        updateValue = valueOrFlag;
      }
      
      // Build update payload based on property name
      let payload: TaskUpdateOptions = {};
      
      switch (propName.toLowerCase()) {
        case 'name':
          payload.name = updateValue;
          break;
        case 'description':
          payload.description = updateValue;
          break;
        case 'markdown_description':
          payload.description = updateValue;
          break;
        case 'status':
          payload.status = updateValue;
          break;
        case 'priority':
          // Convert priority string to numeric value
          switch (updateValue.toLowerCase()) {
            case 'urgent':
              payload.priority = '4';
              break;
            case 'high':
              payload.priority = '3';
              break;
            case 'normal':
              payload.priority = '2';
              break;
            case 'low':
              payload.priority = '1';
              break;
            default:
              // Try to use as-is (might already be numeric)
              payload.priority = updateValue;
          }
          break;
        case 'assignees':
          payload.assignees = updateValue.split(',').map(id => id.trim());
          break;
        case 'due_date':
          payload.due_date = updateValue;
          break;
        case 'tags':
          payload.tags = updateValue.split(',').map(tag => tag.trim());
          break;
        default:
          if (options.json) {
            outputJson({ error: `Unknown property: ${propName}` });
          } else {
            console.error(`❌ Unknown property: ${propName}`);
            console.error('Valid properties: name, description, markdown_description, status, priority, assignees, due_date, tags');
          }
          process.exit(1);
      }
      
      const result = await makeApiRequest<ClickUpTask>('PUT', `/api/v2/task/${taskId}`, payload);
      
      if (options.json) {
        outputJson(result);
      } else {
        console.log(`✅ Task property updated successfully!`);
        console.log(`Task ID: ${taskId}`);
        console.log(`Property: ${propName}`);
        console.log(`URL: ${result.url}`);
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error updating task property:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Delete tasks command
export const deleteTasksCommand = new Command('rm')
  .argument('<taskIds>', 'Comma-separated task IDs to delete')
  .description('Delete multiple tasks')
  .action(async (taskIds: string) => {
    const taskIdArray = taskIds.split(',').map(id => id.trim());
    console.log(`🔄 Deleting ${taskIdArray.length} task(s): ${taskIdArray.join(', ')}`);
    
    try {
      const results = [];
      
      for (const taskId of taskIdArray) {
        try {
          await makeApiRequest('DELETE', `/api/v2/task/${taskId}`);
          console.log(`✅ Deleted task: ${taskId}`);
          results.push({ taskId, success: true });
        } catch (error) {
          console.error(`❌ Failed to delete task ${taskId}:`, (error as Error).message);
          results.push({ taskId, success: false, error: (error as Error).message });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`\n📊 Results: ${successful} deleted, ${failed} failed`);
      
      if (failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Error deleting tasks:', (error as Error).message);
      process.exit(1);
    }
  });

// Main task command that routes to appropriate subcommand
export const taskCommand = new Command('task')
  .argument('[taskId]', 'Task ID or subcommand')
  .argument('[args...]', 'Additional arguments for task operations')
  .option('--json', 'Output result as JSON')
  .description('Task management commands')
  .action(async (taskId: string, args: string[], options: { json?: boolean }) => {
    // If no arguments, show help
    if (!taskId) {
      console.error('❌ Task command requires a subcommand or task ID');
      console.error('');
      console.error('Valid commands:');
      console.error('  clickup task ls [listId]');
      console.error('  clickup task create --list-id <listId> <taskName>');
      console.error('  clickup task <taskId>');
      console.error('  clickup task <taskId> <property> <value>');
      console.error('  clickup task rm <taskId1,taskId2,...>');
      process.exit(1);
    }
    
    // Check if this looks like a task ID (starts with ac_, is hex, or is alphanumeric)
    if (taskId && (
      taskId.startsWith('ac_') || 
      /^[a-f0-9]{6,}$/i.test(taskId) || 
      /^[0-9]{6,}$/.test(taskId) ||
      /^[a-z0-9]{6,}$/i.test(taskId)
    )) {
      // If there are additional args, treat as property update
      if (args.length >= 2 && args[0]) {
        const property = args[0];
        const value = args.slice(1).join(' ');
        
        console.log(`🔄 Updating task ${taskId} property: ${property}`);
        
        try {
          const payload: any = {};
          
          switch (property.toLowerCase()) {
            case 'name':
              payload.name = value;
              break;
            case 'description':
              payload.description = value;
              break;
            case 'status':
              payload.status = value;
              break;
            case 'priority':
              switch (value.toLowerCase()) {
                case 'urgent':
                  payload.priority = '4';
                  break;
                case 'high':
                  payload.priority = '3';
                  break;
                case 'normal':
                  payload.priority = '2';
                  break;
                case 'low':
                  payload.priority = '1';
                  break;
                default:
                  payload.priority = value;
              }
              break;
            case 'assignees':
              payload.assignees = value.split(',').map(id => id.trim());
              break;
            case 'due_date':
              payload.due_date = value;
              break;
            case 'tags':
              payload.tags = value.split(',').map(tag => tag.trim());
              break;
            default:
              console.error(`❌ Unknown property: ${property}`);
              console.error('Valid properties: name, description, status, priority, assignees, due_date, tags');
              process.exit(1);
          }
          
          const result = await makeApiRequest<ClickUpTask>('PUT', `/api/v2/task/${taskId}`, payload);
          
          console.log(`✅ Task property updated successfully!`);
          console.log(`Task ID: ${taskId}`);
          console.log(`Property: ${property}`);
          console.log(`URL: ${result.url}`);
          process.exit(0);
        } catch (error) {
          console.error('❌ Error updating task property:', (error as Error).message);
          process.exit(1);
        }
      } else {
        // Just show task details
        console.log(`🔄 Fetching task: ${taskId}`);
        
        try {
          const result = await makeApiRequest<ClickUpTask>('GET', `/api/v2/task/${taskId}`);
          
          if (options.json) {
            outputJson(result);
          } else {
            console.log('✅ Task Details:');
            console.log(`  ID: ${result.id}`);
            if (result.custom_id) {
              console.log(`  Custom ID: ${result.custom_id}`);
            }
            console.log(`  Name: ${result.name}`);
            console.log(`  Status: ${result.status.status}`);
            console.log(`  Priority: ${result.priority?.priority || 'None'}`);
            console.log(`  Created: ${new Date(result.date_created).toLocaleString()}`);
            console.log(`  Updated: ${new Date(result.date_updated).toLocaleString()}`);
            
            if (result.description) {
              console.log(`  Description: ${result.description}`);
            }
            
            if (result.assignees && result.assignees.length > 0) {
              console.log(`  Assignees: ${result.assignees.map((a: any) => a.username || a.email).join(', ')}`);
            }
            
            if (result.due_date) {
              console.log(`  Due Date: ${new Date(result.due_date).toLocaleString()}`);
            }
            
            if (result.tags && result.tags.length > 0) {
              console.log(`  Tags: ${result.tags.join(', ')}`);
            }
            
            console.log(`  URL: ${result.url}`);
          }
          process.exit(0);
        } catch (error) {
          console.error('❌ Error getting task:', (error as Error).message);
          process.exit(1);
        }
      }
    } else {
      // Not a task ID, show help
      console.error('❌ Unknown task command or invalid task ID');
      console.error('');
      console.error('Valid commands:');
      console.error('  clickup task ls [listId]');
      console.error('  clickup task create --list-id <listId> <taskName>');
      console.error('  clickup task <taskId>');
      console.error('  clickup task <taskId> <property> <value>');
      console.error('  clickup task rm <taskId1,taskId2,...>');
      console.error('');
      console.error('Task IDs should start with "ac_" or be 8+ hex/numeric characters');
      process.exit(1);
    }
  });

// Add subcommands to task command
taskCommand.addCommand(listTasksCommand);
taskCommand.addCommand(createTaskCommand);
taskCommand.addCommand(deleteTasksCommand);
taskCommand.addCommand(getTaskCommand); // Default command
taskCommand.addCommand(updateTaskCommand);

// Set getTaskCommand as the default
(getTaskCommand as any).isDefault = true;
