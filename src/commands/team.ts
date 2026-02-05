import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpTasksResponse } from '../types';

// List team tasks command
export const listTeamTasksCommand = new Command('ls')
  .argument('<teamId>', 'Team ID to get tasks from')
  .description('List all tasks for a team')
  .action(async (teamId: string) => {
    console.log(`🔄 Fetching tasks for team: ${teamId}`);
    
    try {
      const result = await makeApiRequest<ClickUpTasksResponse>('GET', `/api/v2/team/${teamId}/task`);
      
      if (result.tasks && result.tasks.length > 0) {
        console.log(`✅ Found ${result.tasks.length} team task(s):`);
        result.tasks.forEach(task => {
          console.log(`  ${task.id} - ${task.name} [${task.status.status}]`);
          if (task.list && task.list.name) {
            console.log(`    List: ${task.list.name}`);
          }
          if (task.assignees && task.assignees.length > 0) {
            console.log(`    Assignees: ${task.assignees.map(a => a.username || a.email).join(', ')}`);
          }
          console.log(`    URL: ${task.url}`);
          console.log('');
        });
      } else {
        console.log('✅ No team tasks found');
      }
      process.exit(0);
    } catch (error) {
      console.error('❌ Error listing team tasks:', (error as Error).message);
      process.exit(1);
    }
  });

// Main team command
export const teamCommand = new Command('team')
  .description('Team management commands');

// Add subcommands to main command
teamCommand.addCommand(listTeamTasksCommand);
