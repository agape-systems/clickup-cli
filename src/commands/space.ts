import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpSpace } from '../types';

// Create space command
export const createSpaceCommand = new Command('create')
  .argument('<teamId>', 'Team ID to create space in')
  .argument('<spaceName>', 'Space name')
  .description('Create a new ClickUp space')
  .action(async (teamId: string, spaceName: string) => {
    console.log(`🔄 Creating ClickUp space: ${spaceName}`);
    
    try {
      const result = await makeApiRequest<ClickUpSpace>('POST', `/api/v2/team/${teamId}/space`, {
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

// Main space command
export const spaceCommand = new Command('space')
  .description('Space management commands');

// Add subcommands to main command
spaceCommand.addCommand(createSpaceCommand);
