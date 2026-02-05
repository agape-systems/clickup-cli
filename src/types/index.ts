// ClickUp API response types
export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: {
    status: string;
    color: string;
    orderindex: number;
  };
  priority?: {
    priority: string;
    color: string;
    orderindex: string;
  };
  assignees?: Array<{
    id: number;
    username?: string;
    email?: string;
  }>;
  due_date?: string;
  date_created: string;
  date_updated: string;
  tags?: string[];
  url: string;
  list?: {
    id: string;
    name: string;
  };
}

export interface ClickUpSpace {
  id: string;
  name: string;
  color: string;
  access_level: string;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  hidden: boolean;
  space_id: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  content?: string;
  folder_id?: string;
  space_id?: string;
}

export interface ClickUpTeam {
  id: string;
  name: string;
  members: Array<{
    id: number;
    username: string;
    email: string;
  }>;
}

// API response wrapper types
export interface ClickUpTasksResponse {
  tasks: ClickUpTask[];
}

export interface ClickUpListsResponse {
  lists: ClickUpList[];
}

export interface ClickUpFoldersResponse {
  folders: ClickUpFolder[];
}

export interface ClickUpSpacesResponse {
  spaces: ClickUpSpace[];
}

export interface ClickUpTaskResponse extends ClickUpTask {}

export interface ClickUpSpaceResponse extends ClickUpSpace {}

export interface ClickUpFolderResponse extends ClickUpFolder {}

export interface ClickUpListResponse extends ClickUpList {}

// Command types
export interface TaskCreateOptions {
  description?: string;
  assignees?: string;
  priority?: 'normal' | 'high' | 'urgent';
  due_date?: string;
  status?: string;
  tags?: string;
}

export interface TaskUpdateOptions {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignees?: string[];
  due_date?: string;
  tags?: string[];
}

// Error types
export class ClickUpApiError extends Error {
  constructor(
    public statusCode: number,
    public response: string,
    message?: string
  ) {
    super(message || `API Error (${statusCode}): ${response}`);
    this.name = 'ClickUpApiError';
  }
}

export class ClickUpTimeoutError extends Error {
  constructor(public timeout: number) {
    super(`Request timeout after ${timeout}ms`);
    this.name = 'ClickUpTimeoutError';
  }
}
