import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpFolder, ClickUpFoldersResponse } from '../types';
import { outputJson } from '../utils';

// Create folder command
export const createFolderCommand = new Command('create')
  .argument('<spaceId>', 'Space ID to create folder in')
  .argument('<folderName>', 'Folder name')
  .option('--json', 'Output result as JSON')
  .description('Create a new ClickUp folder')
  .action(async (spaceId: string, folderName: string, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Creating ClickUp folder: ${folderName}`);
    }
    
    try {
      const result = await makeApiRequest<ClickUpFolder>('POST', `/api/v2/space/${spaceId}/folder`, {
        name: folderName
      });
      
      if (options.json) {
        outputJson(result);
      } else {
        console.log('✅ Folder created successfully!');
        console.log(`Folder ID: ${result.id}`);
        console.log(`Folder Name: ${result.name}`);
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error creating folder:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// List folders command
export const listFoldersCommand = new Command('ls')
  .argument('<spaceId>', 'Space ID to get folders from')
  .option('--json', 'Output result as JSON')
  .description('List all folders in a space')
  .action(async (spaceId: string, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Fetching folders from space: ${spaceId}`);
    }
    
    try {
      const result = await makeApiRequest<ClickUpFoldersResponse>('GET', `/api/v2/space/${spaceId}/folder`);
      
      if (options.json) {
        outputJson(result);
      } else {
        if (result.folders && result.folders.length > 0) {
          console.log(`✅ Found ${result.folders.length} folder(s):`);
          result.folders.forEach(folder => {
            console.log(`  ${folder.id} - ${folder.name}`);
            if (folder.hidden) {
              console.log(`    Hidden: Yes`);
            }
            console.log(`    Space ID: ${folder.space_id}`);
            console.log('');
          });
        } else {
          console.log('✅ No folders found');
        }
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error listing folders:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Main folder command  
export const folderCommand = new Command('folder')
  .description('Folder management commands');

// Add subcommands to main command
folderCommand.addCommand(createFolderCommand);
folderCommand.addCommand(listFoldersCommand);
