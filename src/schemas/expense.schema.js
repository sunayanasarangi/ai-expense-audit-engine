import * as z from 'zod';

// TODO(Week-3 TS Migration): Add `as const` at the end of this array so Zod infers literal union types

export const AllowedCategories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Other',
];

export const expenseSchema = z.object({
  title: z
    .string({
      error: (issue) =>
        issue.input == undefined
          ? 'Title is required'
          : `Title must be text, received ${typeof issue.input}`,
    })
    .trim()
    .min(1, { message: 'Title cannot be empty' })
    .max(100, { message: 'Title cannot exceed 100 characters' }),

  amount: z
    .number({ error: 'Amount must be a number' })
    .min(0.01, { message: 'Amount must be greater than 0' }),

  category: z.enum(AllowedCategories, {
    message: `Category must be one of ${AllowedCategories.join(', ')}`,
  }),

  date: z
    .isoDate({ error: 'Date must be in YYYY-MM-DD format' })
    .optional()
    .default(() => new Date().toISOString().split('T')[0]),

  merchant: z.string().trim().max(100).optional(),

  notes: z.string().trim().max(500).optional(),
});
