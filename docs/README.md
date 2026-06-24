# PayPilot

PayPilot is an AI-assisted cash-flow planning web application that helps users create budget plans for custom timelines, manage income sources, planned expenses, and savings goals, and receive advisory insights about their financial plan.

PayPilot is designed as a budgeting and planning tool only. It does not connect to bank accounts, move money, recommend investments, or provide regulated financial advice.

## Project Status

This project is currently in MVP development.

## Overview

Many budgeting tools focus on tracking money after it has already been spent. PayPilot focuses on planning before spending happens.

Users can create a budget plan for any custom date range, enter expected income, add planned expenses, set savings goals, and receive a budget health summary. The app then provides AI-assisted advisory feedback to help users understand whether their plan is healthy, tight, or over budget.

## Core Features

### Budget Plans

Create custom budget plans with:

* Title
* Description
* Start date
* End date

### Income Sources

Add income sources such as:

* Salary
* Casual shifts
* Freelance income
* Allowance
* One-off payments

### Expenses

Add planned expenses with:

* Name
* Amount
* Category
* Due date
* Fixed or flexible type

### Savings Goals

Set savings goals for the selected budget period, such as:

* Emergency fund
* Travel savings
* Event savings
* General savings

### Budget Analysis

PayPilot calculates:

* Total income
* Total expenses
* Total fixed expenses
* Total flexible expenses
* Total savings goals
* Remaining buffer
* Expense-to-income ratio
* Savings rate
* Budget health status

### AI-Assisted Advisory Review

PayPilot generates a structured review explaining:

* Overall budget status
* Main risk factor
* Positive observation
* Suggested adjustment
* Plain-English summary

The advisory system is designed to provide general budgeting guidance only.

## MVP Scope

The MVP is complete when a user can:

1. Create a budget plan with a custom date range.
2. Add income sources.
3. Add planned expenses.
4. Add savings goals.
5. View calculated budget results.
6. View a budget health status.
7. Receive an AI-assisted advisory review.

## Out of Scope

The MVP does not include:

* Bank account linking
* Automatic money transfers
* Real-time transaction syncing
* Investment advice
* Tax advice
* Loan advice
* Credit score recommendations
* Financial product recommendations
* Receipt scanning
* Mobile app
* Multi-currency support

## Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL

### ORM

* Prisma

### AI Layer

* OpenAI API or similar LLM provider
* Rule-based fallback advisory logic

### Testing

* Vitest
* Jest
* Supertest

### Deployment

* Vercel for frontend
* Render or Railway for backend
* Neon or Supabase for PostgreSQL

## High-Level Architecture

```text
[User Browser]
     |
     | HTTPS
     v
[React + TypeScript Frontend]
     |
     | REST API
     v
[Node.js + Express + TypeScript Backend]
     |
     | Prisma ORM
     v
[PostgreSQL Database]

[Backend]
     |
     | Structured budget summary
     v
[AI Advisory Service]
```

## Budget Health Logic

The MVP uses simple rules to classify a budget plan.

```text
If remaining buffer < 0:
  status = Over Budget

Else if remaining buffer < 10% of total income:
  status = Tight

Else:
  status = Healthy
```

## Example Advisory Review

```text
Status: Tight

Your plan is possible, but your remaining buffer is low. After planned expenses and savings goals, only 7% of your income remains available. Consider reducing flexible expenses or adjusting your savings goal to maintain a safer cash-flow buffer.
```

## Planned Repository Structure

```text
paypilot/
  README.md
  docs/
    PROJECT_BRIEF.md
    MVP_REQUIREMENTS.md
    ARCHITECTURE.md
    DATABASE_SCHEMA.md
  apps/
    client/
    server/
  prisma/
    schema.prisma
  .env.example
  .gitignore
  package.json
```

## Documentation

Project documentation is stored in the `docs/` folder.

* `PROJECT_BRIEF.md` — product idea, problem statement, MVP scope, and future direction
* `MVP_REQUIREMENTS.md` — user stories, requirements, API plan, and milestones
* `ARCHITECTURE.md` — technical architecture and design decisions
* `DATABASE_SCHEMA.md` — database models, relationships, and Prisma schema draft

## Installation

Installation instructions will be added once the frontend and backend projects are initialised.

Expected setup:

```bash
git clone <repository-url>
cd paypilot
npm install
```

## Environment Variables

The backend will require:

```env
DATABASE_URL=
OPENAI_API_KEY=
PORT=
NODE_ENV=
```

The frontend will require:

```env
VITE_API_BASE_URL=
```

A full `.env.example` file will be provided.

## Development Milestones

### Milestone 1: Project Foundation

* Create GitHub repository
* Add documentation
* Initialise frontend app
* Initialise backend app
* Add health-check API endpoint
* Draft Prisma schema

### Milestone 2: Budget Plan CRUD

* Create budget plans
* View budget plans
* Update budget plans
* Delete budget plans
* Persist data in PostgreSQL

### Milestone 3: Financial Inputs

* Add income sources
* Add expenses
* Add savings goals
* Link all financial items to a budget plan

### Milestone 4: Budget Analysis Engine

* Calculate totals
* Calculate remaining buffer
* Calculate expense-to-income ratio
* Calculate savings rate
* Generate budget health status

### Milestone 5: Advisory Review

* Add rule-based advisory logic
* Add AI-assisted advisory review
* Store advisory reviews
* Display advisory review in the UI

### Milestone 6: Deployment

* Deploy frontend
* Deploy backend
* Deploy database
* Add setup instructions
* Add screenshots

## Ethical and Safety Position

PayPilot is not a financial advisor. It does not provide regulated financial, investment, tax, loan, or credit advice.

The app only provides general budgeting insights based on user-entered information. Users remain responsible for their own financial decisions.

## Future Enhancements

Potential future features include:

* User authentication
* Budget history
* Charts and visual summaries
* Recurring expenses
* Budget comparison across timelines
* CSV export
* PDF reports
* AI chat interface
* Goal progress tracking
* Shared household budgets

