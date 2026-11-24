import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const expensesTable = sqliteTable('expenses', {
  id: int('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  merchant: text('merchant'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  userId: int('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});
