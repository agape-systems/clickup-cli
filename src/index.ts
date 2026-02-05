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
