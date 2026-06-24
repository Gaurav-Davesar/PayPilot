# PayPilot

> A focused cash-flow planning workspace for creating budget timelines, organising planned financial inputs, and understanding budget health before a period begins.

PayPilot is a portfolio project built as a full-stack TypeScript application. It is designed to help people plan—not to control money. It does not connect to banks, access accounts, move funds, or provide investment, tax, lending, or other regulated financial advice.

## What it does today

- Creates, lists, edits, and deletes custom budget plans.
- Stores plans in Neon PostgreSQL through Prisma ORM.
- Displays a clear planning dashboard with plan dates and calculated budget summary placeholders.
- Applies server-side validation for required fields, date validity, and valid date ranges.
- Removes related records automatically when a budget plan is deleted (via Prisma cascade relations).

## Roadmap

- [x] Project foundation: React client, Express API, Prisma schema, Neon database, and documentation.
- [x] Budget plan CRUD: create, view, update, delete, and persist plans.
- [ ] Financial inputs: income sources, planned expenses, and savings goals.
- [ ] Budget analysis: totals, remaining buffer, ratios, and health status.
- [ ] Advisory review: rule-based insights and carefully scoped AI-assisted explanations.
- [ ] Deployment and final portfolio documentation.

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React, TypeScript, Vite |
| API | Node.js, Express, TypeScript |
| Database | Neon PostgreSQL |
| ORM | Prisma 7 with the PostgreSQL driver adapter |

## Project structure

```text
apps/
  client/                 React planning dashboard
  server/                 Express REST API and Prisma integration
    prisma/               Schema and migration history
docs/                     Product, architecture, and data-model notes
```

## Run locally

### 1. Install dependencies

```powershell
cd apps/server
npm install

cd ../client
npm install
```

### 2. Configure the database

Create a Neon PostgreSQL project and put its direct connection string in `apps/server/.env`:

```env
DATABASE_URL="postgresql://<role>:<password>@<endpoint>.aws.neon.tech/<database>?sslmode=require"
PORT=5000
NODE_ENV=development
```

Do not commit `.env` or the database connection string. The repository includes `.env.example` instead.

### 3. Apply migrations and generate Prisma Client

```powershell
cd apps/server
npm run prisma:deploy
npm run prisma:generate
```

### 4. Start the API and dashboard

Use two terminals:

```powershell
# Terminal 1
cd apps/server
npm run dev

# Terminal 2
cd apps/client
npm run dev
```

- Dashboard: `http://localhost:5173`
- API health check: `http://localhost:5000/api/health`
- Prisma Studio: `cd apps/server; npx.cmd prisma studio --port 5555 --browser none`

> On Windows installations that block PowerShell script wrappers, use `npm.cmd` and `npx.cmd` in place of `npm` and `npx`.

## Budget plan API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/budget-plans` | List budget plans |
| `POST` | `/api/budget-plans` | Create a budget plan |
| `GET` | `/api/budget-plans/:id` | Retrieve one budget plan |
| `PUT` | `/api/budget-plans/:id` | Update a budget plan |
| `DELETE` | `/api/budget-plans/:id` | Delete a budget plan |

Example create request:

```json
{
  "title": "July reset",
  "description": "Create a calmer month with room for savings.",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31"
}
```

## Documentation

- [Product brief](docs/ProjectBrief.md)
- [MVP requirements](docs/MVP_Requirments.md)
- [Architecture](docs/Architecture.md)
- [Database schema](docs/DatabaseSchema.md)

## Verification

The current milestone is verified with:

```powershell
cd apps/server
npm run build
npx.cmd prisma validate

cd ../client
npm run build
npm run lint
```

The budget-plan API has also been exercised against the configured Neon database using a create, read, update, and delete flow with the temporary record removed afterward.
