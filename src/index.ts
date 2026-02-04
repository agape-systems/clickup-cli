#!/usr/bin/env node

import { Command } from 'commander';
import { taskCommand, getTaskCommand } from './commands/task';
import { 
  createSpaceCommand, 
  createFolderCommand, 
  createListCommand 
} from './commands/space';
import { listTeamTasksCommand } from './commands/space';

// Main CLI program
const program = new Command();

program
  .name('clickup')
  .description('Enhanced ClickUp CLI tool with comprehensive task management capabilities')
  .version('1.0.0');

// Task commands
program.addCommand(taskCommand);

// Space commands
const spaceCommand = new Command('space')
  .description('Space management commands');

spaceCommand.addCommand(createSpaceCommand);
program.addCommand(spaceCommand);

// Folder commands
const folderCommand = new Command('folder')
  .description('Folder management commands');

folderCommand.addCommand(createFolderCommand);
program.addCommand(folderCommand);

// List commands
const listCommand = new Command('list')
  .description('List management commands');

listCommand.addCommand(createListCommand);
program.addCommand(listCommand);

// Team commands
const teamCommand = new Command('team')
  .description('Team management commands');

teamCommand.addCommand(listTeamTasksCommand);
program.addCommand(teamCommand);

// Parse and execute
program.parse();

// Handle case where no command provided
if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(1);
}

// Legacy commands for backward compatibility
program
  .command('create-space <teamId> <spaceName>')
  .description('Create a new ClickUp space (legacy)')
  .action(async (teamId: string, spaceName: string) => {
    console.log(`🔄 Creating ClickUp space: ${spaceName}`);
    
    try {
      const { makeApiRequest } = await import('./api');
      
      const result = await makeApiRequest<any>('POST', `/api/v2/team/${teamId}/space`, {
        name: spaceName
      });
      
      console.log('✅ Space created successfully!');
      console.log(`Space ID: ${result.id}`);
      console.log(`Space Name: ${result.name}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating space:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('create-folder <spaceId> <folderName>')
  .description('Create a new ClickUp folder (legacy)')
  .action(async (spaceId: string, folderName: string) => {
    console.log(`🔄 Creating ClickUp folder: ${folderName}`);
    
    try {
      const { makeApiRequest } = await import('./api');
      
      const result = await makeApiRequest<any>('POST', `/api/v2/space/${spaceId}/folder`, {
        name: folderName
      });
      
      console.log('✅ Folder created successfully!');
      console.log(`Folder ID: ${result.id}`);
      console.log(`Folder Name: ${result.name}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating folder:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('create-list <parentId> <listName>')
  .option('--in-space', 'Create list directly in space instead of folder')
  .description('Create a new ClickUp list (legacy)')
  .action(async (parentId: string, listName: string, options: { inSpace?: boolean }) => {
    const parentType = options.inSpace ? 'space' : 'folder';
    console.log(`🔄 Creating ClickUp list: ${listName} in ${parentType} ${parentId}`);
    
    try {
      const { makeApiRequest } = await import('./api');
      
      const path = options.inSpace 
        ? `/api/v2/space/${parentId}/list`
        : `/api/v2/folder/${parentId}/list`;
        
      const result = await makeApiRequest<any>('POST', path, {
        name: listName
      });
      
      console.log('✅ List created successfully!');
      console.log(`List ID: ${result.id}`);
      console.log(`List Name: ${result.name}`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating list:', (error as Error).message);
      process.exit(1);
    }
  });

// Environment variable check
if (!process.env.CLICKUP_API_KEY) {
  console.error('❌ Error: CLICKUP_API_KEY environment variable not found');
  console.error('Please set the environment variable and try again');
  console.error('');
  console.error('Example:');
  console.error('  export CLICKUP_API_KEY="your_api_token_here"');
  console.error('  clickup task ls');
  process.exit(1);
}
