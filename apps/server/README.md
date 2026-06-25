# PayPilot API

## Database setup

PayPilot uses Neon PostgreSQL with Prisma. Create a Neon project, then copy its **direct** PostgreSQL connection string from the Neon console into `apps/server/.env`:

```env
DATABASE_URL="postgresql://<role>:<password>@<endpoint>.aws.neon.tech/<database>?sslmode=require"
```

The connection string is a secret and must remain in `.env`; it is intentionally ignored by Git.

With `DATABASE_URL` configured, run the following from this directory:

```powershell
npm run prisma:deploy
npm run prisma:generate
npm run prisma:studio
```

`prisma:deploy` applies the checked-in initial migration. Use `npm run prisma:migrate -- --name <change-name>` for future schema changes during local development.

On Windows systems that block PowerShell scripts, use `npx.cmd prisma <command>` rather than `npx prisma <command>`.

## Current API surface

- `GET /api/health`
- `GET /api/budget-plans`
- `POST /api/budget-plans`
- `GET /api/budget-plans/:id`
- `PUT /api/budget-plans/:id`
- `DELETE /api/budget-plans/:id`
- `POST /api/budget-plans/:id/income`
- `PUT /api/income/:incomeId`
- `DELETE /api/income/:incomeId`
- `POST /api/budget-plans/:id/expenses`
- `PUT /api/expenses/:expenseId`
- `DELETE /api/expenses/:expenseId`
- `POST /api/budget-plans/:id/savings-goals`
- `PUT /api/savings-goals/:goalId`
- `DELETE /api/savings-goals/:goalId`

Financial item mutations return the updated budget plan snapshot, including item lists and recalculated summary totals.
