#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const task_1 = require("./commands/task");
const space_1 = require("./commands/space");
const space_2 = require("./commands/space");
// Main CLI program
const program = new commander_1.Command();
program
    .name('clickup')
    .description('Enhanced ClickUp CLI tool with comprehensive task management capabilities')
    .version('1.0.0');
// Task commands
const taskCommand = new commander_1.Command('task')
    .description('Task management commands');
taskCommand.addCommand(task_1.listTasksCommand);
taskCommand.addCommand(task_1.createTaskCommand);
taskCommand.addCommand(task_1.deleteTasksCommand);
taskCommand.addCommand(task_1.getTaskCommand);
taskCommand.addCommand(task_1.updateTaskCommand);
taskCommand.addCommand(task_1.updateTaskMarkdownCommand);
program.addCommand(taskCommand);
// Space commands
const spaceCommand = new commander_1.Command('space')
    .description('Space management commands');
spaceCommand.addCommand(space_1.createSpaceCommand);
program.addCommand(spaceCommand);
// Folder commands
const folderCommand = new commander_1.Command('folder')
    .description('Folder management commands');
folderCommand.addCommand(space_1.createFolderCommand);
program.addCommand(folderCommand);
// List commands
const listCommand = new commander_1.Command('list')
    .description('List management commands');
listCommand.addCommand(space_1.createListCommand);
program.addCommand(listCommand);
// Team commands
const teamCommand = new commander_1.Command('team')
    .description('Team management commands');
teamCommand.addCommand(space_2.listTeamTasksCommand);
program.addCommand(teamCommand);
// Legacy commands for backward compatibility
program
    .command('create-space <teamId> <spaceName>')
    .description('Create a new ClickUp space (legacy)')
    .action(async (teamId, spaceName) => {
    console.log(`🔄 Creating ClickUp space: ${spaceName}`);
    try {
        const { makeApiRequest } = await import('./api');
        const result = await makeApiRequest('POST', `/api/v2/team/${teamId}/space`, {
            name: spaceName
        });
        console.log('✅ Space created successfully!');
        console.log(`Space ID: ${result.id}`);
        console.log(`Space Name: ${result.name}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating space:', error.message);
        process.exit(1);
    }
});
program
    .command('create-folder <spaceId> <folderName>')
    .description('Create a new ClickUp folder (legacy)')
    .action(async (spaceId, folderName) => {
    console.log(`🔄 Creating ClickUp folder: ${folderName}`);
    try {
        const { makeApiRequest } = await import('./api');
        const result = await makeApiRequest('POST', `/api/v2/space/${spaceId}/folder`, {
            name: folderName
        });
        console.log('✅ Folder created successfully!');
        console.log(`Folder ID: ${result.id}`);
        console.log(`Folder Name: ${result.name}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating folder:', error.message);
        process.exit(1);
    }
});
program
    .command('create-list <parentId> <listName>')
    .option('--in-space', 'Create list directly in space instead of folder')
    .description('Create a new ClickUp list (legacy)')
    .action(async (parentId, listName, options) => {
    const parentType = options.inSpace ? 'space' : 'folder';
    console.log(`🔄 Creating ClickUp list: ${listName} in ${parentType} ${parentId}`);
    try {
        const { makeApiRequest } = await import('./api');
        const path = options.inSpace
            ? `/api/v2/space/${parentId}/list`
            : `/api/v2/folder/${parentId}/list`;
        const result = await makeApiRequest('POST', path, {
            name: listName
        });
        console.log('✅ List created successfully!');
        console.log(`List ID: ${result.id}`);
        console.log(`List Name: ${result.name}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating list:', error.message);
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
// Parse and execute
program.parse();
// Handle case where no command provided
if (process.argv.length <= 2) {
    program.outputHelp();
    process.exit(1);
}
//# sourceMappingURL=index.js.map