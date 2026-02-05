import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpList, ClickUpListsResponse } from '../types';

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

// List lists command
export const listListsCommand = new Command('ls')
  .argument('<parentId>', 'Space ID or Folder ID to get lists from')
  .option('--in-space', 'Get lists from space instead of folder')
  .description('List all lists in a space or folder')
  .action(async (parentId: string, options: { inSpace?: boolean }) => {
    const parentType = options.inSpace ? 'space' : 'folder';
    console.log(`🔄 Fetching lists from ${parentType} ${parentId}`);
    
    try {
      const path = options.inSpace 
        ? `/api/v2/space/${parentId}/list`
        : `/api/v2/folder/${parentId}/list`;
        
      const result = await makeApiRequest<ClickUpListsResponse>('GET', path);
      
      if (result.lists && result.lists.length > 0) {
        console.log(`✅ Found ${result.lists.length} list(s):`);
        result.lists.forEach(list => {
          console.log(`  ${list.id} - ${list.name}`);
          if (list.content) {
            const contentPreview = list.content.length > 50 
              ? list.content.substring(0, 50) + '...' 
              : list.content;
            console.log(`    Content: ${contentPreview}`);
          }
          if (list.space_id) {
            console.log(`    Space ID: ${list.space_id}`);
          }
          if (list.folder_id) {
            console.log(`    Folder ID: ${list.folder_id}`);
          }
          console.log('');
        });
      } else {
        console.log('✅ No lists found');
      }
      process.exit(0);
    } catch (error) {
      console.error('❌ Error listing lists:', (error as Error).message);
      process.exit(1);
    }
  });

// Main list command
export const listCommand = new Command('list')
  .description('List management commands');

// Add subcommands to main command
listCommand.addCommand(createListCommand);
listCommand.addCommand(listListsCommand);
