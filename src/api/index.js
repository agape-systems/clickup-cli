"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiRequest = makeApiRequest;
const https = __importStar(require("https"));
const types_1 = require("../types");
// Make ClickUp API request with timeout and error handling
function makeApiRequest(method, path, data, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const API_KEY = process.env.CLICKUP_API_KEY;
        if (!API_KEY) {
            reject(new Error('CLICKUP_API_KEY environment variable not found'));
            return;
        }
        const jsonData = data ? JSON.stringify(data) : null;
        const options = {
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
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(result);
                    }
                    else {
                        reject(new types_1.ClickUpApiError(res.statusCode, responseData));
                    }
                }
                catch (parseError) {
                    reject(new Error(`Parse error: ${parseError.message}. Raw: ${responseData}`));
                }
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.on('timeout', () => {
            req.destroy();
            reject(new types_1.ClickUpTimeoutError(timeout));
        });
        if (jsonData) {
            req.write(jsonData);
        }
        req.end();
    });
}
//# sourceMappingURL=index.js.map