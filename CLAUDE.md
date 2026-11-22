# CLAUDE.md

This file provides architectural guidance and coding conventions for AI assistants working in this repository.

## Project Overview

- **Name:** AI Expense & Policy Audit Engine
- **Current Phase:** Phase 1 (Node.js v22 LTS + Express v5 + Zod v4 + SQLite/Drizzle ORM)
- **Planned Evolution:** Strict TypeScript migration (Week 3), Anthropic Claude SDK structured parsing & RAG policy auditing with PostgreSQL `pgvector` (Weeks 4–6), and standalone MCP Server (Week 7).

## Commands

- `npm run dev` — Start development server with `--watch` and `--env-file-if-exists=.env`
- `npm test` — Run unit and integration tests using native `node:test`
- `npm run lint` — Run ESLint across `src/`
- `npm run format` — Format code with Prettier
- `npm run db:push` — Push Drizzle schema changes (`src/db/schema.js`) to SQLite (`local.db`)

## Architecture & Conventions

- **Module System:** Native ES Modules (`"type": "module"`). Always include explicit `.js` file extensions in relative imports, and use `{ }` curly braces for named exports (`validateSchema`, `expenseSchema`).
- **File Naming:** Use `*.schema.js` for Zod validation schemas (`src/schemas/`) and `*.routes.js` for Express routers (`src/routes/`).
- **Validation (Zod v4):** Use `import * as z from 'zod'`. Format validation errors using the top-level `z.flattenError(result.error)` helper (do not use deprecated `.flatten()`).
- **Middleware:** Use the domain-agnostic `validateSchema(schema)` factory in `src/middleware/validate.js` to sanitize `req.body` (`req.body = result.data`) before route handlers run.
- **Express v5 Error Handling:** Async route errors propagate automatically to the 4-argument global error handler `(err, req, res, _next)` in `app.js`. Prefix unused parameters with `_`.
- **Testing:** Write unit and HTTP integration tests using built-in `node:test` (`describe`, `it`, `mock.fn()`) and `node:assert/strict` with ephemeral port `0` (`app.listen(0)`).
- **Database (Drizzle ORM + SQLite):** Define SQLite tables in `src/db/schema.js` using `drizzle-orm/sqlite-core` and import `{ db }` from `src/db/index.js`. Always use `.$defaultFn(() => new Date().toISOString())` for dynamic timestamps instead of static `.default(...)`.
