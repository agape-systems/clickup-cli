// Command barrel file - exports all main commands and subcommands

// Task commands
export { taskCommand } from './task';

// Space commands  
export { spaceCommand, createSpaceCommand } from './space';

// Folder commands
export { folderCommand, createFolderCommand } from './folder';

// List commands
export { listCommand, createListCommand } from './list';

// Team commands
export { teamCommand, listTeamTasksCommand } from './team';
