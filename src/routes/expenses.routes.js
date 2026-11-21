import { Router } from 'express';

import { validateSchema } from '../middleware/validate.js';

import { expenseSchema } from '../schemas/expense.schema.js';

const router = Router();

// POST /
router.post('/', validateSchema(expenseSchema), (req, res) => {
  res.status(201).json({
    message: 'Expense validated successfully',
    data: req.body,
  });
});

export default router;
