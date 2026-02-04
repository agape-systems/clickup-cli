import * as https from 'https';
import { ClickUpApiError, ClickUpTimeoutError } from '../types';

// Make ClickUp API request with timeout and error handling
export function makeApiRequest<T = any>(
  method: string,
  path: string,
  data?: any,
  timeout: number = 30000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const API_KEY = process.env.CLICKUP_API_KEY;
    
    if (!API_KEY) {
      reject(new Error('CLICKUP_API_KEY environment variable not found'));
      return;
    }

    const jsonData = data ? JSON.stringify(data) : null;

    const options: https.RequestOptions = {
      hostname: 'api.clickup.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: timeout
    };

    if (jsonData) {
      (options.headers as any)['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new ClickUpApiError(res.statusCode || 0, responseData));
          }
        } catch (parseError) {
          reject(new Error(`Parse error: ${(parseError as Error).message}. Raw: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new ClickUpTimeoutError(timeout));
    });

    if (jsonData) {
      req.write(jsonData);
    }
    req.end();
  });
}
