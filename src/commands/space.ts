import { Command } from 'commander';
import { makeApiRequest } from '../api';
import { ClickUpSpace, ClickUpSpacesResponse } from '../types';
import { outputJson } from '../utils';

// Create space command
export const createSpaceCommand = new Command('create')
  .argument('<teamId>', 'Team ID to create space in')
  .argument('<spaceName>', 'Space name')
  .option('--json', 'Output result as JSON')
  .description('Create a new ClickUp space')
  .action(async (teamId: string, spaceName: string, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Creating ClickUp space: ${spaceName}`);
    }
    
    try {
      const result = await makeApiRequest<ClickUpSpace>('POST', `/api/v2/team/${teamId}/space`, {
        name: spaceName
      });
      
      if (options.json) {
        outputJson(result);
      } else {
        console.log('✅ Space created successfully!');
        console.log(`Space ID: ${result.id}`);
        console.log(`Space Name: ${result.name}`);
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error creating space:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// List spaces command
export const listSpacesCommand = new Command('ls')
  .argument('<teamId>', 'Team ID to get spaces from')
  .option('--json', 'Output result as JSON')
  .description('List all spaces in a team')
  .action(async (teamId: string, options: { json?: boolean }) => {
    if (!options.json) {
      console.log(`🔄 Fetching spaces from team: ${teamId}`);
    }
    
    try {
      const result = await makeApiRequest<ClickUpSpacesResponse>('GET', `/api/v2/team/${teamId}/space`);
      
      if (options.json) {
        outputJson(result);
      } else {
        if (result.spaces && result.spaces.length > 0) {
          console.log(`✅ Found ${result.spaces.length} space(s):`);
          result.spaces.forEach(space => {
            console.log(`  ${space.id} - ${space.name}`);
            console.log(`    Color: ${space.color}`);
            console.log(`    Access Level: ${space.access_level}`);
            console.log('');
          });
        } else {
          console.log('✅ No spaces found');
        }
      }
      process.exit(0);
    } catch (error) {
      if (options.json) {
        outputJson({ error: (error as Error).message });
      } else {
        console.error('❌ Error listing spaces:', (error as Error).message);
      }
      process.exit(1);
    }
  });

// Main space command
export const spaceCommand = new Command('space')
  .description('Space management commands');

// Add subcommands to main command
spaceCommand.addCommand(createSpaceCommand);
spaceCommand.addCommand(listSpacesCommand);
