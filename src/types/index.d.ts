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
export interface ClickUpTasksResponse {
    tasks: ClickUpTask[];
}
export interface ClickUpTaskResponse extends ClickUpTask {
}
export interface ClickUpSpaceResponse extends ClickUpSpace {
}
export interface ClickUpFolderResponse extends ClickUpFolder {
}
export interface ClickUpListResponse extends ClickUpList {
}
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
export declare class ClickUpApiError extends Error {
    statusCode: number;
    response: string;
    constructor(statusCode: number, response: string, message?: string);
}
export declare class ClickUpTimeoutError extends Error {
    timeout: number;
    constructor(timeout: number);
}
//# sourceMappingURL=index.d.ts.map