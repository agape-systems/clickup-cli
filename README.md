# ClickUp CLI Tool

A TypeScript-based CLI tool for interacting with ClickUp API, built with Commander.js for robust argument parsing.

## Features

- **Task Management**: Create, read, update, delete tasks
- **Space/Folder/List Management**: Organize your workspace
- **Team Operations**: List team-wide tasks
- **File Support**: Update descriptions from files
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Proper exit codes and timeout management

## Installation

```bash
npm install
npm run build
```

## Usage

### Environment Setup
Set your ClickUp API key:
```bash
export CLICKUP_API_KEY="your_api_token_here"
```

### Task Commands

```bash
# List tasks
clickup task ls [listId]

# View task details
clickup task <taskId>

# Create a task
clickup task create --list-id <listId> "<task name>" [options]

# Update task properties
clickup task <taskId> <property> <value>
clickup task <taskId> <property> --file <filePath>

# Delete tasks
clickup task rm <taskId1,taskId2,...>

# Legacy markdown update
clickup task <taskId> markdown_description --file <filePath>
```

### Space/Folder/List Commands

```bash
# Create space
clickup space create <teamId> "<space name>"

# List spaces in a team
clickup space ls <teamId>

# Create folder
clickup folder create <spaceId> "<folder name>"

# List folders in a space
clickup folder ls <spaceId>

# Create list
clickup list create <parentId> "<list name>" [--in-space]

# List lists in a space or folder
clickup list ls <parentId> [--in-space]
```

### Team Commands

```bash
# List team tasks
clickup team <teamId> task ls
```

## Options

### Task Creation Options
- `--description <text>` - Task description
- `--assignees <user1,user2>` - Comma-separated user IDs
- `--priority <normal|high|urgent>` - Task priority
- `--due-date <YYYY-MM-DD>` - Due date
- `--status <status>` - Custom status
- `--tags <tag1,tag2>` - Comma-separated tags

### Updateable Properties
- `name` - Task name
- `description` - Task description
- `status` - Task status
- `priority` - Task priority
- `assignees` - Comma-separated user IDs
- `due_date` - Due date (YYYY-MM-DD)
- `tags` - Comma-separated tags

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Run built version
npm start
```

## Error Handling

- Exit code 0: Success
- Exit code 1: Error (API error, timeout, invalid command)
- 30-second timeout on all API requests

## Architecture

- `src/api/` - HTTP request handling
- `src/commands/` - Command implementations
- `src/types/` - TypeScript type definitions
- `src/index.ts` - Main CLI entry point
