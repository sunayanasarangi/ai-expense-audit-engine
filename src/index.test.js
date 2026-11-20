import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Environment Setup', () => {
    it('loads variables from .env automatically', () => {
        assert.strictEqual(process.env.PORT, '3000');
        assert.strictEqual(process.env.ANTHROPIC_API_KEY, 'your_api_key_here'); 
    });     
});