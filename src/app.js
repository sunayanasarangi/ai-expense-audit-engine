import express from 'express';

/*Creates your Express application instance
 *(the central object where you attach middleware and routes).
 */
const app = express();

/*Registers global middleware that runs on every incoming request.
 *Whenever a client sends JSON data (like { "amount": 250, "category": "Food" }),
 *Express automatically parses it and attaches it to req.body.
 */
app.use(express.json());

//The Health Check Route (GET /health)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/*Testing Native Async Error Catching (GET /test-async-error)
 *Async route that throws an error WITHOUT try/catch
 */

app.get('/test-async-error', async () => {
  //Simulate an asynchronous database or API error
  await Promise.resolve();
  const error = new Error('Simulated async database error');
  error.status = 503;
  throw error;
});

//Global Error Handling Middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
});

/*Makes app available to both src/index.js
 *(which opens port 3000 for real traffic) and
 *src/index.test.js (which starts temporary test servers on random ports).
 */
export default app;
