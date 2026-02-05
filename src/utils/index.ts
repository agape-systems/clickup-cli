import { makeApiRequest } from '../api';
import { ClickUpTask } from '../types';

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
