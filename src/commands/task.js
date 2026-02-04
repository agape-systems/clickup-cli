"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskMarkdownCommand = exports.deleteTasksCommand = exports.updateTaskCommand = exports.createTaskCommand = exports.getTaskCommand = exports.listTasksCommand = void 0;
const fs = __importStar(require("fs"));
const commander_1 = require("commander");
const api_1 = require("../api");
const types_1 = require("../types");
// List tasks in a list or all accessible tasks
exports.listTasksCommand = new commander_1.Command('ls')
    .argument('[listId]', 'List ID to get tasks from (optional)')
    .description('List tasks in a list or all accessible tasks')
    .action(async (listId) => {
    console.log(`🔄 Fetching tasks${listId ? ` for list ${listId}` : '...'}`);
    try {
        const path = listId
            ? `/api/v2/list/${listId}/task`
            : '/api/v2/task';
        const result = await (0, api_1.makeApiRequest)('GET', path);
        if (result.tasks && result.tasks.length > 0) {
            console.log(`✅ Found ${result.tasks.length} task(s):`);
            result.tasks.forEach(task => {
                console.log(`  ${task.id} - ${task.name} [${task.status.status}]`);
                if (task.assignees && task.assignees.length > 0) {
                    console.log(`    Assignees: ${task.assignees.map(a => a.username || a.email).join(', ')}`);
                }
                if (task.due_date) {
                    console.log(`    Due: ${new Date(task.due_date).toLocaleDateString()}`);
                }
                console.log(`    URL: ${task.url}`);
                console.log('');
            });
        }
        else {
            console.log('✅ No tasks found');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error listing tasks:', error.message);
        process.exit(1);
    }
});
// Get a single task
exports.getTaskCommand = new commander_1.Command('<taskId>')
    .argument('<taskId>', 'Task ID to view')
    .description('Get detailed information about a task')
    .action(async (taskId) => {
    console.log(`🔄 Fetching task: ${taskId}`);
    try {
        const result = await (0, api_1.makeApiRequest)('GET', `/api/v2/task/${taskId}`);
        console.log('✅ Task Details:');
        console.log(`  ID: ${result.id}`);
        console.log(`  Name: ${result.name}`);
        console.log(`  Status: ${result.status.status}`);
        console.log(`  Priority: ${result.priority?.priority || 'None'}`);
        console.log(`  Created: ${new Date(result.date_created).toLocaleString()}`);
        console.log(`  Updated: ${new Date(result.date_updated).toLocaleString()}`);
        if (result.description) {
            console.log(`  Description: ${result.description}`);
        }
        if (result.assignees && result.assignees.length > 0) {
            console.log(`  Assignees: ${result.assignees.map(a => a.username || a.email).join(', ')}`);
        }
        if (result.due_date) {
            console.log(`  Due Date: ${new Date(result.due_date).toLocaleString()}`);
        }
        if (result.tags && result.tags.length > 0) {
            console.log(`  Tags: ${result.tags.join(', ')}`);
        }
        console.log(`  URL: ${result.url}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error getting task:', error.message);
        process.exit(1);
    }
});
// Create task command
exports.createTaskCommand = new commander_1.Command('create')
    .requiredOption('--list-id <listId>', 'List ID to create task in')
    .argument('<taskName>', 'Task name')
    .option('--description <description>', 'Task description')
    .option('--assignees <user1,user2>', 'Comma-separated user IDs')
    .option('--priority <priority>', 'Task priority (normal, high, urgent)', 'normal')
    .option('--due-date <date>', 'Due date (YYYY-MM-DD)')
    .option('--status <status>', 'Custom status')
    .option('--tags <tag1,tag2>', 'Comma-separated tags')
    .description('Create a new task')
    .action(async (taskName, options) => {
    console.log(`🔄 Creating ClickUp task: ${taskName}`);
    try {
        const payload = {
            name: taskName,
            description: options.description || '',
            assignees: options.assignees ? options.assignees.split(',').map(id => id.trim()) : [],
            priority: options.priority || 'normal',
            status: options.status,
            tags: options.tags ? options.tags.split(',').map(tag => tag.trim()) : []
        };
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
        const result = await (0, api_1.makeApiRequest)('POST', `/api/v2/list/${options.listId}/task`, payload);
        console.log('✅ Task created successfully!');
        console.log(`Task ID: ${result.id}`);
        console.log(`Task Name: ${result.name}`);
        console.log(`URL: ${result.url}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating task:', error.message);
        process.exit(1);
    }
});
// Update task property command
exports.updateTaskCommand = new commander_1.Command('<taskId> <property> <value>')
    .argument('<taskId>', 'Task ID to update')
    .argument('<property>', 'Property name to update')
    .argument('<value>', 'New value or -file <filePath>')
    .description('Update a task property')
    .action(async (taskId, propName, valueOrFlag, command) => {
    console.log(`🔄 Updating task ${taskId} property: ${propName}`);
    try {
        let updateValue;
        let isFile = false;
        if (valueOrFlag === '-file') {
            const filePath = command.args[3]; // Get the file path after -file
            if (!filePath) {
                console.error('❌ Error: -file requires a file path');
                process.exit(1);
            }
            try {
                updateValue = fs.readFileSync(filePath, 'utf8');
                isFile = true;
            }
            catch (error) {
                console.error(`❌ Error reading file "${filePath}":`, error.message);
                process.exit(1);
            }
        }
        else {
            updateValue = valueOrFlag;
        }
        // Build update payload based on property name
        let payload = {};
        switch (propName.toLowerCase()) {
            case 'name':
                payload.name = updateValue;
                break;
            case 'description':
                payload.description = updateValue;
                break;
            case 'status':
                payload.status = updateValue;
                break;
            case 'priority':
                payload.priority = updateValue;
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
                console.error(`❌ Unknown property: ${propName}`);
                console.error('Valid properties: name, description, status, priority, assignees, due_date, tags');
                process.exit(1);
        }
        const result = await (0, api_1.makeApiRequest)('PUT', `/api/v2/task/${taskId}`, payload);
        console.log(`✅ Task property updated successfully!`);
        console.log(`Task ID: ${taskId}`);
        console.log(`Property: ${propName}`);
        console.log(`URL: ${result.url}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error updating task property:', error.message);
        process.exit(1);
    }
});
// Delete tasks command
exports.deleteTasksCommand = new commander_1.Command('rm')
    .argument('<taskIds>', 'Comma-separated task IDs to delete')
    .description('Delete multiple tasks')
    .action(async (taskIds) => {
    const taskIdArray = taskIds.split(',').map(id => id.trim());
    console.log(`🔄 Deleting ${taskIdArray.length} task(s): ${taskIdArray.join(', ')}`);
    try {
        const results = [];
        for (const taskId of taskIdArray) {
            try {
                await (0, api_1.makeApiRequest)('DELETE', `/api/v2/task/${taskId}`);
                console.log(`✅ Deleted task: ${taskId}`);
                results.push({ taskId, success: true });
            }
            catch (error) {
                console.error(`❌ Failed to delete task ${taskId}:`, error.message);
                results.push({ taskId, success: false, error: error.message });
            }
        }
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        console.log(`\n📊 Results: ${successful} deleted, ${failed} failed`);
        if (failed > 0) {
            process.exit(1);
        }
        else {
            process.exit(0);
        }
    }
    catch (error) {
        console.error('❌ Error deleting tasks:', error.message);
        process.exit(1);
    }
});
// Legacy markdown description update
exports.updateTaskMarkdownCommand = new commander_1.Command('markdown_description')
    .argument('<taskId>', 'Task ID to update')
    .option('-file <filePath>', 'Read markdown from file')
    .argument('[content]', 'Markdown content (if not using -file)')
    .description('Update task markdown description (legacy)')
    .action(async (taskId, options, command) => {
    console.log(`🔄 Updating ClickUp task: ${taskId}`);
    let markdownContent;
    if (options.file) {
        try {
            markdownContent = fs.readFileSync(options.file, 'utf8');
        }
        catch (error) {
            console.error(`❌ Error reading file "${options.file}":`, error.message);
            process.exit(1);
        }
    }
    else {
        markdownContent = command.args.slice(2).join(' '); // Get remaining args as content
        if (!markdownContent) {
            console.error('❌ Error: markdown content is required');
            process.exit(1);
        }
    }
    if (markdownContent.length > 100) {
        console.log(`📝 Content: ${markdownContent.substring(0, 100)}...`);
    }
    else {
        console.log(`📝 Content: ${markdownContent}`);
    }
    try {
        const result = await (0, api_1.makeApiRequest)('PUT', `/api/v2/task/${taskId}`, {
            markdown_description: markdownContent
        });
        console.log('✅ ClickUp task updated successfully!');
        console.log(`Task ID: ${taskId}`);
        console.log(`URL: ${result.url}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error updating task:', error.message);
        process.exit(1);
    }
});
//# sourceMappingURL=task.js.map