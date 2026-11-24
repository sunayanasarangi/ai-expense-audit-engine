# CLAUDE.md

This file provides architectural guidance and coding conventions for AI assistants working in this repository.

## Project Overview

- **Name:** AI Expense & Policy Audit Engine
- **Current Phase:** Phase 1 — Week 1 Complete (Node.js v22 LTS + Express v5 + Zod v4 + SQLite/Drizzle ORM + JWT Auth)
- **Planned Evolution:** Strict TypeScript migration (Week 3), Vercel AI SDK (`ai`) structured extraction & tool-calling Q&A backed by free Google Gemini (`gemini-2.5-flash` / `text-embedding-004`) with Groq (`Llama 3.3`) fallback and PostgreSQL `pgvector` Hybrid RAG (Weeks 4–6), standalone MCP Server (Week 7), and Swagger `/docs`, Docker, Redis & GitHub Actions CI/CD (Weeks 8–10).

## Commands

- `npm run dev` — Start development server with `--watch` and `--env-file-if-exists=.env`
- `npm test` — Run unit and integration tests using native `node:test` (isolated `:memory:` SQLite)
- `npm run lint` — Run ESLint across `src/`
- `npm run format` — Format code with Prettier
- `npm run db:push` — Push Drizzle schema changes (`src/db/schema.js`) to SQLite (`local.db`)

## Architecture & Conventions

- **Module System & Built-Ins:** Native ES Modules (`"type": "module"`). Always include explicit `.js` file extensions in relative imports, use `{ }` curly braces for named exports (`validateSchema`, `expenseSchema`, `registerSchema`, `loginSchema`, `db`, `usersTable`, `expensesTable`), and use the `node:` protocol prefix for built-in modules (`node:crypto`, `node:util`, `node:test`).
- **File Naming:** Use `*.schema.js` for Zod validation schemas (`src/schemas/`), `*.routes.js` for Express routers (`src/routes/`), and place pure cryptographic/domain helpers in `src/utils/`.
- **Validation (Zod v4):** Use `import * as z from 'zod'` and top-level formatters (`z.email()`, `z.iso.date()`). Format validation errors using top-level `z.flattenError(result.error)` (do not use deprecated `.flatten()`).
- **Middleware & Separation of Concerns:** Use the domain-agnostic `validateSchema(schema)` factory in `src/middleware/validate.js` to sanitize `req.body` (`req.body = result.data`) before route handlers run. Keep `verifyToken()` in `src/utils/auth.js` as a pure helper that throws on invalid/expired tokens, and translate JWT failures into `401 Unauthorized` responses inside `requireAuth` (`src/middleware/auth.js`).
- **Authentication & Tenant Isolation:** Hash passwords with `node:crypto` (`scrypt` + `randomBytes(16)` + `timingSafeEqual`) and sign/verify `HS256` JWTs (`sub: String(user.id)`) with `jose` in `src/utils/auth.js`. Fail closed if `JWT_SECRET` is unset (never hardcode fallback secrets), never return `passwordHash` in API responses, and scope all `/expenses` queries strictly by `req.user.id`.
- **Database (Drizzle ORM + SQLite):** Define SQLite tables in `src/db/schema.js` using `drizzle-orm/sqlite-core` (defining parent `usersTable` above `expensesTable`) and import `{ db }` from `src/db/index.js`. Always use `.$defaultFn(() => new Date().toISOString())` for dynamic timestamps (never static `.default(...)`), never chain `.hash()` on column builders, and import query helpers (`eq`, `desc`) from `'drizzle-orm'` (never call `col.desc()`).
- **Express v5 Error Handling & API Envelopes:** Async route errors propagate automatically to the 4-argument global error handler `(err, req, res, _next)` in `app.js` (prefix unused parameters with `_`). Keep JSON response envelopes uniform (`{ data }` / `{ message, data }` on success, `{ error }` on failure).
- **Testing:** Write unit and HTTP integration tests using built-in `node:test` (`describe`, `it`, `mock.fn()`) and `node:assert/strict` with ephemeral port `0` (`app.listen(0)`) and isolated `DB_FILE_NAME=:memory:` + `pushSQLiteSchema` from `'drizzle-kit/api'`.
