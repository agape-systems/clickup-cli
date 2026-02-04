"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeamTasksCommand = exports.createListCommand = exports.createFolderCommand = exports.createSpaceCommand = void 0;
const commander_1 = require("commander");
const api_1 = require("../api");
const types_1 = require("../types");
// Create space command
exports.createSpaceCommand = new commander_1.Command('create')
    .argument('<teamId>', 'Team ID to create space in')
    .argument('<spaceName>', 'Space name')
    .description('Create a new ClickUp space')
    .action(async (teamId, spaceName) => {
    console.log(`🔄 Creating ClickUp space: ${spaceName}`);
    try {
        const result = await (0, api_1.makeApiRequest)('POST', `/api/v2/team/${teamId}/space`, {
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
// Create folder command
exports.createFolderCommand = new commander_1.Command('create')
    .argument('<spaceId>', 'Space ID to create folder in')
    .argument('<folderName>', 'Folder name')
    .description('Create a new ClickUp folder')
    .action(async (spaceId, folderName) => {
    console.log(`🔄 Creating ClickUp folder: ${folderName}`);
    try {
        const result = await (0, api_1.makeApiRequest)('POST', `/api/v2/space/${spaceId}/folder`, {
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
// Create list command
exports.createListCommand = new commander_1.Command('create')
    .argument('<parentId>', 'Folder ID or Space ID to create list in')
    .argument('<listName>', 'List name')
    .option('--in-space', 'Create list directly in space instead of folder')
    .description('Create a new ClickUp list')
    .action(async (parentId, listName, options) => {
    const parentType = options.inSpace ? 'space' : 'folder';
    console.log(`🔄 Creating ClickUp list: ${listName} in ${parentType} ${parentId}`);
    try {
        const path = options.inSpace
            ? `/api/v2/space/${parentId}/list`
            : `/api/v2/folder/${parentId}/list`;
        const result = await (0, api_1.makeApiRequest)('POST', path, {
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
// List team tasks command
exports.listTeamTasksCommand = new commander_1.Command('ls')
    .argument('<teamId>', 'Team ID to get tasks from')
    .description('List all tasks for a team')
    .action(async (teamId) => {
    console.log(`🔄 Fetching tasks for team: ${teamId}`);
    try {
        const result = await (0, api_1.makeApiRequest)('GET', `/api/v2/team/${teamId}/task`);
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
        }
        else {
            console.log('✅ No team tasks found');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error listing team tasks:', error.message);
        process.exit(1);
    }
});
//# sourceMappingURL=space.js.map