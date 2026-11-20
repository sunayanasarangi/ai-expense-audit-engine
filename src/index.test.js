import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from './app.js';

describe('Express V5 Server and Native Aysnc Error Handling', () => {
  let server;
  let baseUrl;

  // Start a server at port 0: (OS picks an available port automatically)
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  // Cleanly close the server after tests finish
  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it('loads variables from .env automatically', () => {
    assert.strictEqual(process.env.PORT, '3000');
    assert.strictEqual(process.env.ANTHROPIC_API_KEY, 'your_api_key_here');
  });

  it('Get /health returns 200 and status ok', async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.status, 'OK');
    assert.ok(data.timestamp, 'Expected ISO timestamp in response');
  });

  it('Get /test-async-error returns 503 and error message', async () => {
    const response = await fetch(`${baseUrl}/test-async-error`);
    assert.strictEqual(response.status, 503);
    const data = await response.json();
    assert.strictEqual(data.error, 'Simulated async database error');
  });
});
