# AI Expense & Policy Audit Engine

A backend REST API built with Node.js, Express v5, and Drizzle ORM for managing expenses, parsing unstructured receipt text, and auditing transactions against company policies using Claude AI.

> **Status:** Active Development — Phase 1 (Core REST API & Validation)

---

## Tech Stack

**Current (Phase 1)**

- **Runtime:** Node.js v22 LTS (ES Modules & `--env-file-if-exists`)
- **Framework:** Express v5
- **Validation:** Zod
- **Database:** SQLite + Drizzle ORM _(Migrating to PostgreSQL + `pgvector` in Phase 2)_
- **Code Quality:** ESLint, Prettier, Native Node.js Test Runner (`node --test`)

**Planned (Phases 2 & 3)**

- **Language:** Strict TypeScript
- **AI & RAG:** Anthropic Claude SDK (`@anthropic-ai/sdk`), Custom MCP Server, `pgvector`
- **Caching & DevOps:** Redis, Docker, GitHub Actions CI

---

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm

### Installation & Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sunayanasarangi/ai-expense-audit-engine.git
   cd <your-repo-name>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file and update the values:

   ```bash
   cp .env.example .env
   ```

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

| Method | Endpoint      |  Auth Required  | Description                     |   Status    |
| :----- | :------------ | :-------------: | :------------------------------ | :---------: |
| `GET`  | `/health`     |       No        | Verify server status            |    Done     |
| `POST` | `/expenses`   | Planned (Day 6) | Create a new validated expense  | In Progress |
| `GET`  | `/expenses`   | Planned (Day 5) | Retrieve stored expenses        |  Upcoming   |
| `POST` | `/auth/login` |       No        | Authenticate user and issue JWT |  Upcoming   |

### 1. Health Check (`GET /health`)

```bash
curl http://localhost:3000/health
```

### 2. Create Expense (`POST /expenses`)

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
  -d '{
    "title": "Client Lunch",
    "amount": 450.50,
    "category": "Food",
    "date": "2026-11-21",
    "merchant": "Swiggy"
  }'
```

---

## Testing & Code Quality

- **Run tests:** `npm test`
- **Run tests in watch mode:** `npm run test:watch`
- **Run linter:** `npm run lint`
- **Format code:** `npm run format`

---

## Project Roadmap

- [x] **Week 1 (In Progress):** Express v5 server, Zod request validation, Drizzle SQLite setup, JWT auth
- [ ] **Weeks 2–3:** Full migration to strict TypeScript (`z.infer`) & mock expense parser
- [ ] **Week 4:** Claude SDK integration (structured receipt extraction, prompt caching & SSE streaming)
- [ ] **Weeks 5–6:** PostgreSQL + `pgvector` migration & RAG policy compliance auditing with citations
- [ ] **Week 7:** Custom MCP Server (`mcp-expense-server`) in TypeScript
- [ ] **Week 8:** Multi-agent orchestration, Redis caching, rate limiting & Vitest suite
- [ ] **Weeks 10–11:** Docker containerization, cloud deployment & OpenAPI/Swagger docs
