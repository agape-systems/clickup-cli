"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickUpTimeoutError = exports.ClickUpApiError = void 0;
// Error types
class ClickUpApiError extends Error {
    statusCode;
    response;
    constructor(statusCode, response, message) {
        super(message || `API Error (${statusCode}): ${response}`);
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'ClickUpApiError';
    }
}
exports.ClickUpApiError = ClickUpApiError;
class ClickUpTimeoutError extends Error {
    timeout;
    constructor(timeout) {
        super(`Request timeout after ${timeout}ms`);
        this.timeout = timeout;
        this.name = 'ClickUpTimeoutError';
    }
}
exports.ClickUpTimeoutError = ClickUpTimeoutError;
//# sourceMappingURL=index.js.map