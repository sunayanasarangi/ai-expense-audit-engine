import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import app from './app.js';

//named exports, hence imported within curly braces
import { validateSchema } from './middleware/validate.js';
import { expenseSchema } from './schemas/expense.schema.js';

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

  it('POST /expenses with valid data returns 201 and the correct response', async () => {
    const validExpense = {
      title: 'Lunch',
      amount: 12.5,
      category: 'Food',
    };
    const response = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validExpense),
    });
    assert.strictEqual(response.status, 201);
    const data = await response.json();
    assert.strictEqual(data.message, 'Expense validated successfully');
    assert.strictEqual(data.data.title, validExpense.title);
    assert.strictEqual(data.data.amount, validExpense.amount);
    assert.strictEqual(data.data.category, validExpense.category);
  });

  it('POST /expenses with invalid data returns 400 and validation error', async () => {
    const invalidExpense = {
      title: '',
      amount: -5,
      category: 'InvalidCategory',
    };
    const response = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidExpense),
    });
    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.strictEqual(data.error, 'Validation failed');
    assert.ok(
      data.details.fieldErrors.amount,
      'Expected validation error for amount'
    );
    assert.ok(
      data.details.fieldErrors.title,
      'Expected validation error for title'
    );
    assert.ok(
      data.details.fieldErrors.category,
      'Expected validation error for category'
    );
  });
});

describe('Zod Schema Validation', () => {
  it('Validates a correct expense object successfully', () => {
    const req = {
      body: {
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
      },
    };

    const res = {};

    const next = mock.fn();

    validateSchema(expenseSchema)(req, res, next);

    assert.strictEqual(
      next.mock.calls.length,
      1,
      'Next function should be called once'
    );
    assert.strictEqual(req.body.title, 'Lunch');
    assert.strictEqual(req.body.amount, 12.5);
    assert.strictEqual(req.body.category, 'Food');
    assert.match(req.body.date, /^\d{4}-\d{2}-\d{2}$/); // Default date is set
  });

  it('Fails validation for an incorrect expense object', () => {
    const req = {
      body: {
        title: '',
        amount: -5,
        category: 'InvalidCategory',
      },
    };
    let statusCode = null;
    let responseBody = null;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseBody = data;
      },
    };
    const next = mock.fn();

    validateSchema(expenseSchema)(req, res, next);

    assert.strictEqual(
      next.mock.calls.length,
      0,
      'Next function should not be called for invalid input'
    );
    assert.strictEqual(statusCode, 400, 'Response status should be 400');
    assert.strictEqual(responseBody.error, 'Validation failed');
    assert.ok(responseBody.details.fieldErrors.amount);
  });
});
