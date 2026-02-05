import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpFolder } from '../types';

// Create folder command
export const createFolderCommand = new Command('create')
  .argument('<spaceId>', 'Space ID to create folder in')
  .argument('<folderName>', 'Folder name')
  .description('Create a new ClickUp folder')
  .action(async (spaceId: string, folderName: string) => {
    console.log(`🔄 Creating ClickUp folder: ${folderName}`);
    
    try {
      const result = await makeApiRequest<ClickUpFolder>('POST', `/api/v2/space/${spaceId}/folder`, {
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

// Main folder command  
export const folderCommand = new Command('folder')
  .description('Folder management commands');

// Add subcommands to main command
folderCommand.addCommand(createFolderCommand);
