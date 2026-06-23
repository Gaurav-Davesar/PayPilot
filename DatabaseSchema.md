# PayPilot Database Schema

## 1. Overview

PayPilot uses a relational database model because the core data has clear relationships:

* A budget plan can have many income sources.
* A budget plan can have many expenses.
* A budget plan can have many savings goals.
* A budget plan can have many advisory reviews.

The MVP will use PostgreSQL with Prisma ORM.

## 2. Database Goals

The database design should:

1. Store budget plans for custom timelines.
2. Support multiple income sources per plan.
3. Support multiple expenses per plan.
4. Support multiple savings goals per plan.
5. Store generated advisory reviews.
6. Keep the schema simple and suitable for an MVP.
7. Allow future user authentication without requiring major redesign.

## 3. Entity Relationship Summary

```text
BudgetPlan
  ├── IncomeSource[]
  ├── Expense[]
  ├── SavingsGoal[]
  └── AdvisoryReview[]
```

A `BudgetPlan` is the parent entity. Income sources, expenses, savings goals, and advisory reviews are linked to a specific budget plan.

## 4. Tables

## 4.1 BudgetPlan

The `BudgetPlan` table stores the main budget planning period.

### Purpose

Stores a user-created budget plan for a custom date range.

### Fields

```text
id            String      Primary key
title         String      Required
description   String?     Optional
startDate     DateTime    Required
endDate       DateTime    Required
createdAt     DateTime    Auto-generated
updatedAt     DateTime    Auto-updated
```

### Validation Rules

* `title` is required.
* `startDate` is required.
* `endDate` is required.
* `endDate` must be after `startDate`.

### Example

```json
{
  "id": "plan_001",
  "title": "July Budget",
  "description": "Monthly cash-flow plan",
  "startDate": "2026-07-01",
  "endDate": "2026-07-31"
}
```

## 4.2 IncomeSource

The `IncomeSource` table stores income linked to a budget plan.

### Purpose

Allows a budget plan to include multiple income sources.

Examples:

* Salary
* Casual shifts
* Freelance income
* Allowance
* Refunds
* One-off payments

### Fields

```text
id              String      Primary key
budgetPlanId    String      Foreign key
name            String      Required
amount          Decimal     Required
expectedDate    DateTime?   Optional
notes           String?     Optional
createdAt       DateTime    Auto-generated
updatedAt       DateTime    Auto-updated
```

### Validation Rules

* `name` is required.
* `amount` is required.
* `amount` must be greater than 0.
* `budgetPlanId` must reference an existing budget plan.

### Example

```json
{
  "id": "income_001",
  "budgetPlanId": "plan_001",
  "name": "Casual Work Pay",
  "amount": 2800.00,
  "expectedDate": "2026-07-15",
  "notes": "Estimated pay"
}
```

## 4.3 Expense

The `Expense` table stores planned expenses linked to a budget plan.

### Purpose

Allows users to add expenses that will occur during the selected budget period.

Examples:

* Rent
* Groceries
* Fuel
* Phone bill
* Subscriptions
* Utilities
* Personal spending

### Fields

```text
id              String        Primary key
budgetPlanId    String        Foreign key
name            String        Required
amount          Decimal       Required
category        String        Required
type            ExpenseType   Required
dueDate         DateTime?     Optional
notes           String?       Optional
createdAt       DateTime      Auto-generated
updatedAt       DateTime      Auto-updated
```

### ExpenseType Enum

```text
FIXED
FLEXIBLE
```

### Validation Rules

* `name` is required.
* `amount` is required.
* `amount` must be greater than 0.
* `category` is required.
* `type` must be either `FIXED` or `FLEXIBLE`.
* `budgetPlanId` must reference an existing budget plan.

### Example

```json
{
  "id": "expense_001",
  "budgetPlanId": "plan_001",
  "name": "Rent",
  "amount": 900.00,
  "category": "Housing",
  "type": "FIXED",
  "dueDate": "2026-07-05",
  "notes": "Monthly rent payment"
}
```

## 4.4 SavingsGoal

The `SavingsGoal` table stores savings targets linked to a budget plan.

### Purpose

Allows users to set planned savings targets within a budget period.

Examples:

* Emergency fund
* Travel savings
* Wedding savings
* Car deposit
* Rent bond
* General savings

### Fields

```text
id              String        Primary key
budgetPlanId    String        Foreign key
name            String        Required
targetAmount    Decimal       Required
priority        Priority?     Optional
notes           String?       Optional
createdAt       DateTime      Auto-generated
updatedAt       DateTime      Auto-updated
```

### Priority Enum

```text
LOW
MEDIUM
HIGH
```

### Validation Rules

* `name` is required.
* `targetAmount` is required.
* `targetAmount` must be greater than 0.
* `budgetPlanId` must reference an existing budget plan.

### Example

```json
{
  "id": "goal_001",
  "budgetPlanId": "plan_001",
  "name": "Emergency Fund",
  "targetAmount": 1000.00,
  "priority": "HIGH",
  "notes": "Minimum monthly savings target"
}
```

## 4.5 AdvisoryReview

The `AdvisoryReview` table stores generated advisory feedback for a budget plan.

### Purpose

Stores rule-based or AI-assisted reviews so users can view previously generated budget insights.

### Fields

```text
id                    String          Primary key
budgetPlanId          String          Foreign key
status                BudgetStatus    Required
summary               String          Required
riskFactor            String?         Optional
positiveObservation   String?         Optional
suggestedAdjustment   String?         Optional
reviewType            ReviewType      Required
createdAt             DateTime        Auto-generated
updatedAt             DateTime        Auto-updated
```

### BudgetStatus Enum

```text
HEALTHY
TIGHT
OVER_BUDGET
```

### ReviewType Enum

```text
RULE_BASED
AI_ASSISTED
```

### Validation Rules

* `budgetPlanId` must reference an existing budget plan.
* `status` is required.
* `summary` is required.
* `reviewType` is required.

### Example

```json
{
  "id": "review_001",
  "budgetPlanId": "plan_001",
  "status": "TIGHT",
  "summary": "Your plan is possible, but your remaining buffer is low.",
  "riskFactor": "Only 7% of income remains after expenses and savings goals.",
  "positiveObservation": "Your savings goal is clearly defined.",
  "suggestedAdjustment": "Consider reducing flexible expenses by $150.",
  "reviewType": "AI_ASSISTED"
}
```

## 5. Prisma Schema Draft

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BudgetPlan {
  id          String           @id @default(cuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime

  incomeSources  IncomeSource[]
  expenses       Expense[]
  savingsGoals   SavingsGoal[]
  advisoryReviews AdvisoryReview[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model IncomeSource {
  id           String     @id @default(cuid())
  budgetPlanId String
  budgetPlan   BudgetPlan @relation(fields: [budgetPlanId], references: [id], onDelete: Cascade)

  name         String
  amount       Decimal
  expectedDate DateTime?
  notes        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Expense {
  id           String      @id @default(cuid())
  budgetPlanId String
  budgetPlan   BudgetPlan @relation(fields: [budgetPlanId], references: [id], onDelete: Cascade)

  name         String
  amount       Decimal
  category     String
  type         ExpenseType
  dueDate      DateTime?
  notes        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model SavingsGoal {
  id           String      @id @default(cuid())
  budgetPlanId String
  budgetPlan   BudgetPlan @relation(fields: [budgetPlanId], references: [id], onDelete: Cascade)

  name         String
  targetAmount Decimal
  priority     Priority?
  notes        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model AdvisoryReview {
  id                    String       @id @default(cuid())
  budgetPlanId           String
  budgetPlan             BudgetPlan  @relation(fields: [budgetPlanId], references: [id], onDelete: Cascade)

  status                 BudgetStatus
  summary                String
  riskFactor             String?
  positiveObservation    String?
  suggestedAdjustment    String?
  reviewType             ReviewType

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

enum ExpenseType {
  FIXED
  FLEXIBLE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum BudgetStatus {
  HEALTHY
  TIGHT
  OVER_BUDGET
}

enum ReviewType {
  RULE_BASED
  AI_ASSISTED
}
```

## 6. Relationships

### BudgetPlan to IncomeSource

One budget plan can have many income sources.

```text
BudgetPlan 1 ─── many IncomeSource
```

If a budget plan is deleted, its income sources should also be deleted.

### BudgetPlan to Expense

One budget plan can have many expenses.

```text
BudgetPlan 1 ─── many Expense
```

If a budget plan is deleted, its expenses should also be deleted.

### BudgetPlan to SavingsGoal

One budget plan can have many savings goals.

```text
BudgetPlan 1 ─── many SavingsGoal
```

If a budget plan is deleted, its savings goals should also be deleted.

### BudgetPlan to AdvisoryReview

One budget plan can have many advisory reviews.

```text
BudgetPlan 1 ─── many AdvisoryReview
```

If a budget plan is deleted, its advisory reviews should also be deleted.

## 7. Budget Summary Calculations

Budget summaries do not need to be stored in the MVP. They can be calculated dynamically from the database records.

### Total Income

```text
totalIncome = sum of all income source amounts
```

### Total Expenses

```text
totalExpenses = sum of all expense amounts
```

### Total Fixed Expenses

```text
totalFixedExpenses = sum of expenses where type = FIXED
```

### Total Flexible Expenses

```text
totalFlexibleExpenses = sum of expenses where type = FLEXIBLE
```

### Total Savings Goals

```text
totalSavingsGoals = sum of all savings goal target amounts
```

### Remaining Buffer

```text
remainingBuffer = totalIncome - totalExpenses - totalSavingsGoals
```

### Expense-to-Income Ratio

```text
expenseToIncomeRatio = totalExpenses / totalIncome
```

### Savings Rate

```text
savingsRate = totalSavingsGoals / totalIncome
```

## 8. Budget Health Logic

The MVP will use simple budget health rules.

```text
If remainingBuffer < 0:
  status = OVER_BUDGET

Else if remainingBuffer < totalIncome * 0.10:
  status = TIGHT

Else:
  status = HEALTHY
```

These rules are intentionally simple for the MVP and can be improved later.

## 9. Why Budget Summary Is Not Stored

The MVP should calculate totals dynamically instead of storing summary totals.

Reason:

* Avoids duplicated data.
* Reduces risk of stale calculations.
* Keeps the database simpler.
* Makes calculation logic easier to test.
* Allows summaries to update instantly when income, expenses, or savings goals change.

A future version could store cached summaries if performance becomes an issue.

## 10. Future Schema Enhancements

Possible future tables include:

### User

For authentication and saved plans per user.

```text
User
  id
  email
  name
  createdAt
  updatedAt
```

### Category

For predefined and custom expense categories.

```text
Category
  id
  name
  type
  createdAt
  updatedAt
```

### RecurringExpense

For expenses that repeat weekly, fortnightly, or monthly.

```text
RecurringExpense
  id
  userId
  name
  amount
  frequency
  category
  createdAt
  updatedAt
```

### BudgetScenario

For comparing different versions of the same plan.

```text
BudgetScenario
  id
  budgetPlanId
  name
  createdAt
  updatedAt
```

### Notification

For future reminders.

```text
Notification
  id
  userId
  message
  scheduledAt
  status
  createdAt
  updatedAt
```

These are not part of the MVP.

## 11. Design Decisions

### Decision 1: Use Decimal for Money

Money values should use `Decimal`, not floating-point numbers.

Reason:

Floating-point numbers can create rounding errors. Decimal types are more appropriate for financial values.

### Decision 2: Use CUID IDs

The MVP uses Prisma’s `cuid()` for IDs.

Reason:

CUIDs are easy to generate, unique, and suitable for distributed environments.

### Decision 3: Cascade Delete Child Records

When a budget plan is deleted, related income sources, expenses, savings goals, and advisory reviews should also be deleted.

Reason:

These records do not make sense without their parent budget plan.

### Decision 4: Store Advisory Reviews

Advisory reviews are stored instead of generated only temporarily.

Reason:

This allows users to view previous advice and compare how a plan changed over time.

### Decision 5: Do Not Store Calculated Totals

Budget totals should be calculated dynamically.

Reason:

This avoids duplicated data and keeps the MVP simpler.

## 12. Summary

The PayPilot database schema is centred around the `BudgetPlan` entity. Each budget plan can contain income sources, expenses, savings goals, and advisory reviews.

This schema keeps the MVP focused while still supporting a professional full-stack application with financial calculations, AI-assisted insights, and future expansion.
