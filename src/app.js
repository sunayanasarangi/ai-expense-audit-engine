import express from 'express';
import expensesRouter from './routes/expenses.routes.js';

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

app.use('/expenses', expensesRouter);

//Global Error Handling Middleware
//Must always stay at the very bottom so it catches errors from all routes above it).
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
