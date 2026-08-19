import { makeApiRequest } from '../api';
import { ClickUpTask } from '../types';

// Detect custom task IDs (e.g., AS-1341, SK-123, BD-42)
export function isCustomId(taskId: string): boolean {
  return /^[A-Za-z]{2,}-\d+$/.test(taskId);
}

// Build the API path for a task, adding custom_task_ids params when needed
export function getTaskPath(taskId: string, basePath?: string): string {
  const path = basePath || `/api/v2/task/${taskId}`;
  if (isCustomId(taskId)) {
    const teamId = process.env.CLICKUP_TEAM_ID;
    if (!teamId) {
      throw new Error('CLICKUP_TEAM_ID environment variable is required when using custom task IDs (e.g., AS-1341). Set it to your ClickUp workspace/team ID.');
    }
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}custom_task_ids=true&team_id=${teamId}`;
  }
  return path;
}

// Retry function for getting custom_id after task creation
export async function waitForCustomId(taskId: string, maxAttempts: number = 4, delayMs: number = 5000): Promise<ClickUpTask> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const task = await makeApiRequest<ClickUpTask>('GET', `/api/v2/task/${taskId}`);
      
      // If custom_id is available, return the task
      if (task.custom_id) {
        return task;
      }
      
      // If not available and we have more attempts, wait
      if (attempts < maxAttempts) {
        console.log(`⏳ Waiting for custom_id... (attempt ${attempts}/${maxAttempts})`);
        await sleep(delayMs);
      }
    } catch (error) {
      console.error(`❌ Error fetching task (attempt ${attempts}/${maxAttempts}):`, (error as Error).message);
      
      // If this is the last attempt, throw the error
      if (attempts === maxAttempts) {
        throw error;
      }
      
      // Otherwise wait and retry
      if (attempts < maxAttempts) {
        await sleep(delayMs);
      }
    }
  }
  
  // If we get here, return the task without custom_id (last attempt result)
  const lastTask = await makeApiRequest<ClickUpTask>('GET', `/api/v2/task/${taskId}`);
  return lastTask;
}

// Simple sleep function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// JSON output formatter
export function outputJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

// Pretty output formatter
export function outputPretty(lines: string[]): void {
  lines.forEach(line => console.log(line));
}
