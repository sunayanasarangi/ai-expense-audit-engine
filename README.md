# AI Expense & Policy Audit Engine

A backend REST API built with Node.js, Express v5, and Drizzle ORM for managing user-scoped expenses, parsing unstructured receipt text, and auditing transactions against company policies using AI.

> **Status:** Active Development — Week 1 Complete (REST API, Drizzle SQLite & JWT Auth)

---

## Tech Stack

**Current (Phase 1)**

- **Runtime:** Node.js v22 LTS (ES Modules & `--env-file-if-exists`)
- **Framework:** Express v5
- **Validation:** Zod v4
- **Database:** SQLite (`@libsql/client`) + Drizzle ORM _(Migrating to PostgreSQL + `pgvector` in Phase 2)_
- **Authentication:** JWT (`jose`) & `node:crypto` (`scrypt` + `timingSafeEqual`)
- **Code Quality:** ESLint, Prettier, Native Node.js Test Runner (`node --test` with `:memory:` SQLite)

**Planned (Phases 2 & 3)**

- **Language:** Strict TypeScript (`z.infer`)
- **AI & RAG:** Vercel AI SDK (`ai`) with Google Gemini (`gemini-2.5-flash` / `text-embedding-004`) + Groq (`Llama 3.3`) fallback, `pgvector`, Custom MCP Server
- **Docs, Caching & DevOps:** OpenAPI/Swagger UI (`/docs`), Redis, Python `/evals`, Docker, GitHub Actions CI

---

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm

### Installation & Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sunayanasarangi/ai-expense-audit-engine.git
   cd ai-expense-audit-engine
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file and generate a 256-bit `JWT_SECRET`:

   ```bash
   cp .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Update `.env` with your generated `JWT_SECRET` and `DB_FILE_NAME=file:local.db`.

4. **Initialize the SQLite database:**

   ```bash
   npm run db:push
   ```

5. **Start the development server:**

   ```bash
   npm run dev
   ```

---

## API Endpoints

| Method | Endpoint         | Auth Required | Description                                 | Status |
| :----- | :--------------- | :-----------: | :------------------------------------------ | :----: |
| `GET`  | `/health`        |      No       | Verify server status                        |  Done  |
| `POST` | `/auth/register` |      No       | Register a new user and issue a JWT         |  Done  |
| `POST` | `/auth/login`    |      No       | Authenticate user and issue a JWT           |  Done  |
| `POST` | `/expenses`      |   Yes (JWT)   | Create a validated expense for current user |  Done  |
| `GET`  | `/expenses`      |   Yes (JWT)   | Retrieve current user's stored expenses     |  Done  |

### 1. Health Check (`GET /health`)

```bash
curl http://localhost:3000/health
```

### 2. Register & Login (`POST /auth/register`, `POST /auth/login`)

**Register a new account:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Log in to obtain a JWT:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### 3. Create Expense (`POST /expenses`)

Requires `Authorization: Bearer <token>` header.

**Request Body Rules:**

- `title` _(string, required)_ — 1 to 100 characters
- `amount` _(number, required)_ — Minimum `0.01`
- `category` _(string, required)_ — One of: `Food`, `Transportation`, `Entertainment`, `Utilities`, `Healthcare`, `Shopping`, `Other`
- `date` _(string, optional)_ — Valid ISO date in `YYYY-MM-DD` format (defaults to today's UTC date if omitted)
- `merchant` _(string, optional)_ — Up to 100 characters
- `notes` _(string, optional)_ — Up to 500 characters

**Example Request:**

```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Client Lunch",
    "amount": 450.50,
    "category": "Food",
    "date": "2026-11-24",
    "merchant": "Swiggy"
  }'
```

### 4. List User Expenses (`GET /expenses`)

Returns all expenses belonging to the authenticated user, sorted newest-first:

```bash
curl http://localhost:3000/expenses \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Testing & Code Quality

- **Run unit & integration tests (isolated `:memory:` SQLite):** `npm test`
- **Run tests in watch mode:** `npm run test:watch`
- **Run linter:** `npm run lint`
- **Format code:** `npm run format`

---

## Project Roadmap

- [x] **Week 1:** Express v5 server, Zod v4 validation, Drizzle SQLite setup, JWT auth & user-scoped expenses
- [ ] **Weeks 2–3:** TypeScript fundamentals, strict `.ts` migration (`z.infer`) & mock expense parser
- [ ] **Week 4:** Vercel AI SDK integration (`POST /expenses/parse`) with Gemini-to-Groq failover
- [ ] **Weeks 5–6:** PostgreSQL + `pgvector` migration, tool-calling Q&A (`POST /expenses/ask`) & Hybrid RAG search
- [ ] **Week 7:** Custom MCP Server (`mcp-expense-server`) in TypeScript & Claude Academy courses
- [ ] **Weeks 8–10:** Redis caching, GitHub Actions CI, Docker, Swagger `/docs`, Python `/evals` & cloud deployment
