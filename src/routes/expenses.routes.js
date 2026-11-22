import { Router } from 'express';

import { validateSchema } from '../middleware/validate.js';

import { expenseSchema } from '../schemas/expense.schema.js';

import { db } from '../db/index.js';
import { expensesTable } from '../db/schema.js';
import { desc } from 'drizzle-orm';

const router = Router();

// POST / (Insert & Return Created Row):
router.post('/', validateSchema(expenseSchema), async (req, res) => {
  const [createdExpense] = await db
    .insert(expensesTable)
    .values(req.body)
    .returning();

  res.status(201).json({
    message: 'Expense created successfully',
    data: createdExpense,
  });
});

// GET / (Return All Rows):
router.get('/', async (req, res) => {
  //Query all rows sorted newest-first
  const expenses = await db
    .select()
    .from(expensesTable)
    .orderBy(desc(expensesTable.createdAt));
  res.status(200).json({ data: expenses });
});

export default router;
