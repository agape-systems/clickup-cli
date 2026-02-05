#!/usr/bin/env node

import { Command } from 'commander';
import { 
  taskCommand,
  spaceCommand,
  folderCommand,
  listCommand,
  teamCommand
} from './commands';

// Main CLI program
const program = new Command();

program
  .name('clickup')
  .description('Enhanced ClickUp CLI tool with comprehensive task management capabilities')
  .version('1.0.0');

// Task commands
program.addCommand(taskCommand);

// Space, Folder, List, and Team commands
program.addCommand(spaceCommand);
program.addCommand(folderCommand);
program.addCommand(listCommand);
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
