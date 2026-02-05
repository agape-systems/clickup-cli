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

**Task Creation Options:**
```bash
# Basic task with plain text description
clickup task create --list-id <listId> "Task name" --description "Plain text description"

# Task with markdown description (recommended for rich content)
clickup task create --list-id <listId> "Task name" --markdown "# Heading\n**Bold text**"

# Task with markdown from file (best for long content)
clickup task create --list-id <listId> "Task name" --markdown-file README.md

# Task with all options
clickup task create --list-id <listId> "Task name" \
  --markdown-file description.md \
  --assignees user1,user2 \
  --priority high \
  --due-date 2024-12-31 \
  --status "In Progress" \
  --tags urgent,backend \
  --json
```

# Update task properties
clickup task <taskId> <property> <value>
clickup task <taskId> <property> --file <filePath>

**Task Update Examples:**
```bash
# Update task name
clickup task <taskId> name "New task name"

# Update with plain text description
clickup task <taskId> description "Plain text description"

# Update with markdown description (recommended for rich content)
clickup task <taskId> markdown_description "# Heading\n**Bold text**"

# Update markdown description from file (best for long content)
clickup task <taskId> markdown_description --file README.md

# Update other properties
clickup task <taskId> priority high
clickup task <taskId> status "In Progress"
clickup task <taskId> assignees user1,user2
```

# Delete tasks
clickup task rm <taskId1,taskId2,...>
```

**Available task properties for update:**
- `name` - Task name
- `description` - Plain text description
- `markdown_description` - Markdown description (recommended for rich content)
- `status` - Task status
- `priority` - Task priority (low, normal, high, urgent)
- `assignees` - Comma-separated user IDs
- `due_date` - Due date (YYYY-MM-DD)
- `tags` - Comma-separated tags

**Markdown Update Tips:**
- Use `markdown_description` for rich formatted content
- Use `--file` option for long markdown content
- Supports headings, bold, italic, lists, links, and other markdown features

**Example:**
```bash
# Update task name
clickup task <taskId> name "New task name"

# Update markdown description from file
clickup task <taskId> markdown_description --file README.md

# Update priority
clickup task <taskId> priority high
```

#### JSON Output
Add `--json` flag to any command to get structured JSON output:
```bash
# Task commands
clickup task create --list-id <listId> "Task name" --json
clickup task <taskId> --json
clickup task ls --json

# Space commands
clickup space create <teamId> "Space name" --json
clickup space ls <teamId> --json

# Folder commands
clickup folder create <spaceId> "Folder name" --json
clickup folder ls <spaceId> --json

# List commands
clickup list create <parentId> "List name" --json
clickup list ls <parentId> --json

# Team commands
clickup team ls <teamId> --json
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
