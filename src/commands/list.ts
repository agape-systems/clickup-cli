import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpList } from '../types';

// Create list command
export const createListCommand = new Command('create')
  .argument('<parentId>', 'Folder ID or Space ID to create list in')
  .argument('<listName>', 'List name')
  .option('--in-space', 'Create list directly in space instead of folder')
  .description('Create a new ClickUp list')
  .action(async (parentId: string, listName: string, options: { inSpace?: boolean }) => {
    const parentType = options.inSpace ? 'space' : 'folder';
    console.log(`🔄 Creating ClickUp list: ${listName} in ${parentType} ${parentId}`);
    
    try {
      const path = options.inSpace 
        ? `/api/v2/space/${parentId}/list`
        : `/api/v2/folder/${parentId}/list`;
        
      const result = await makeApiRequest<ClickUpList>('POST', path, {
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

// Main list command
export const listCommand = new Command('list')
  .description('List management commands');

// Add subcommands to main command
listCommand.addCommand(createListCommand);
