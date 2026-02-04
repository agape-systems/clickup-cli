#!/usr/bin/env node

// Test modular ClickUp CLI
const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing Modular ClickUp CLI Structure\n');

const CLI_PATH = path.join(__dirname, '..', 'index.js');

const tests = [
    // Test basic command structure
    { cmd: [], desc: 'No arguments (should show usage)' },
    { cmd: ['task', 'ls'], desc: 'Task list command' },
    { cmd: ['task', 'create', '--list-id', '123', 'Test'], desc: 'Task create command' },
    { cmd: ['space', 'create', '123', 'Test Space'], desc: 'Space create command' },
    { cmd: ['team', '123', 'task', 'ls'], desc: 'Team task list command' },
];

console.log('--- Module Loading Tests ---');

// Test if all modules load correctly
try {
    console.log('✅ Testing module imports...');
    
    const { showUsage } = require('../lib/usage');
    console.log('  ✅ Usage module loaded');
    
    const { parseTaskListArgs } = require('../lib/parsers/task');
    console.log('  ✅ Task parser module loaded');
    
    const { parseSpaceCreateArgs } = require('../lib/parsers/space');
    console.log('  ✅ Space parser module loaded');
    
    const { listTasks } = require('../lib/commands/task');
    console.log('  ✅ Task commands module loaded');
    
    const { createSpace } = require('../lib/commands/space');
    console.log('  ✅ Space commands module loaded');
    
    const { makeApiRequest } = require('../lib/api');
    console.log('  ✅ API module loaded');
    
    console.log('✅ All modules loaded successfully!\n');
} catch (error) {
    console.error('❌ Module loading failed:', error.message);
    process.exit(1);
}

console.log('--- Command Structure Tests ---');
let passed = 0;
let total = 0;

for (const test of tests) {
    total++;
    console.log(`\n🧪 ${test.desc}: node index.js ${test.cmd.join(' ')}`);
    
    try {
        const result = execSync(`node "${CLI_PATH}" ${test.cmd.join(' ')}`, { 
            encoding: 'utf8',
            env: { ...process.env, CLICKUP_API_KEY: 'test-key' },
            timeout: 5000
        });
        
        if (result.includes('Usage:') || result.includes('API Error')) {
            console.log('✅ Command structure valid');
            passed++;
        } else {
            console.log('❓ Unexpected output');
        }
    } catch (error) {
        if (error.message.includes('Usage:') || error.message.includes('API Error')) {
            console.log('✅ Command structure valid');
            passed++;
        } else {
            console.log('❌ Command structure invalid');
        }
    }
}

console.log(`\n📊 Results: ${passed}/${total} tests passed`);

// Show module structure
console.log('\n--- Module Structure ---');
console.log('✨ ClickUp CLI is now modularized:');
console.log('  📁 lib/');
console.log('    📄 api.js - HTTP request handling');
console.log('    📄 usage.js - Help and usage information');
console.log('    📁 parsers/');
console.log('      📄 task.js - Task command parsing');
console.log('      📄 space.js - Space/folder/list parsing');
console.log('    📁 commands/');
console.log('      📄 task.js - Task operations');
console.log('      📄 space.js - Space/folder/list operations');
console.log('  📄 index.js - Main entry point');
console.log('  📄 package.json - Node.js package configuration');
console.log('\n🔄 Each module has a single responsibility:');
console.log('  • API: HTTP requests and error handling');
console.log('  • Parsers: Command argument parsing');
console.log('  • Commands: Business logic and ClickUp operations');
console.log('  • Usage: Help text and documentation');
console.log('  • Index: Command routing and orchestration');
