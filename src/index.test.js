import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';

//named exports, hence imported within curly braces
import { validateSchema } from './middleware/validate.js';
import { expenseSchema } from './schemas/expense.schema.js';

describe('Express V5 Server and Native Aysnc Error Handling', () => {
  let server;
  let baseUrl;
  let app;
  let aliceToken;
  let aliceId;

  // Start a server at port 0: (OS picks an available port automatically)
  before(async () => {
    process.env.DB_FILE_NAME = ':memory:';
    //set JWT_SECRET so tests pass even in CI without a .env file
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || 'test-jwt-secret-key-at-least-32-chars-long';

    const [{ default: loadedApp }, { db }, schema, { pushSQLiteSchema }] =
      await Promise.all([
        import('./app.js'),
        import('./db/index.js'),
        import('./db/schema.js'),
        import('drizzle-kit/api'),
      ]);

    app = loadedApp;

    const sqlitePush = await pushSQLiteSchema(schema, db);
    await sqlitePush.apply();

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

  it('POST /auth/register creates a user and returns a JWT', async () => {
    const user = {
      username: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    };
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    assert.strictEqual(response.status, 201);
    const body = await response.json();
    assert.ok(body.data.token);
    assert.ok(body.data.user.id);
    assert.strictEqual('passwordHash' in body.data.user, false);
    aliceToken = body.data.token;
    aliceId = body.data.user.id;
  });

  it('POST /auth/register rejects a duplicate email', async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Alice',
        email: 'alice@example.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(response.status, 409);
    assert.deepStrictEqual(await response.json(), {
      error: 'Email already registered',
    });
  });

  it('POST /auth/login returns a JWT for valid credentials', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.ok(body.data.token);
    assert.strictEqual('passwordHash' in body.data.user, false);
  });

  it('POST /auth/login rejects an invalid password', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'incorrect-password',
      }),
    });
    assert.strictEqual(response.status, 401);
    assert.deepStrictEqual(await response.json(), {
      error: 'Invalid email or password',
    });
  });

  it('GET and POST /expenses require authentication', async () => {
    const getResponse = await fetch(`${baseUrl}/expenses`);
    const postResponse = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Lunch',
        amount: 12.5,
        category: 'Food',
      }),
    });

    assert.strictEqual(getResponse.status, 401);
    assert.strictEqual(postResponse.status, 401);
  });

  it('POST /expenses creates an expense for the authenticated user', async () => {
    const validExpense = {
      title: 'Lunch',
      amount: 12.5,
      category: 'Food',
    };
    const response = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify(validExpense),
    });
    assert.strictEqual(response.status, 201);
    const body = await response.json();
    assert.strictEqual(body.message, 'Expense created successfully');
    assert.strictEqual(body.data.title, validExpense.title);
    assert.strictEqual(body.data.amount, validExpense.amount);
    assert.strictEqual(body.data.category, validExpense.category);
    assert.ok(body.data.id);
    assert.strictEqual(body.data.userId, aliceId);
    assert.ok(body.data.createdAt);
  });

  it("GET /expenses returns the authenticated user's expenses", async () => {
    const response = await fetch(`${baseUrl}/expenses`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body.data), 'Expected data to be an array');
    assert.ok(
      body.data.some((expense) => expense.title === 'Lunch'),
      'Expected the created expense in the response'
    );
  });

  it("GET /expenses does not return another user's expenses", async () => {
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Bob',
        email: 'bob@example.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(registerResponse.status, 201);
    const registerBody = await registerResponse.json();

    const response = await fetch(`${baseUrl}/expenses`, {
      headers: { Authorization: `Bearer ${registerBody.data.token}` },
    });
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.data.length, 0);
  });

  it('POST /expenses with invalid data returns 400 and validation error', async () => {
    const invalidExpense = {
      title: '',
      amount: -5,
      category: 'InvalidCategory',
    };
    const response = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
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
