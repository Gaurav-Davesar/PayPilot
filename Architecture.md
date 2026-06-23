# PayPilot Architecture

## 1. Overview

PayPilot is a full-stack AI-assisted cash-flow planning web application. The system allows users to create custom budget plans, add income sources, expenses, and savings goals, calculate budget health, and receive advisory insights.

The application is designed as a professional portfolio project using a simple, maintainable architecture suitable for an MVP.

PayPilot does not connect to bank accounts, move money, recommend investments, or provide regulated financial advice.

## 2. Architecture Goals

The main goals of the architecture are:

1. Keep the MVP simple and shippable.
2. Use a professional full-stack structure.
3. Separate frontend, backend, database, and AI responsibilities clearly.
4. Keep financial calculation logic testable.
5. Avoid unnecessary complexity such as microservices, queues, and distributed systems.
6. Make the project suitable for GitHub, deployment, and resume presentation.

## 3. High-Level Architecture

```text
[User Browser]
     |
     | HTTPS
     v
[React + TypeScript Frontend]
     |
     | REST API Requests
     v
[Node.js + Express + TypeScript Backend]
     |
     | Prisma ORM
     v
[PostgreSQL Database]

[Backend]
     |
     | Structured Budget Summary
     v
[AI Advisory Service]
```

## 4. Main Components

### 4.1 Frontend

The frontend will be built using:

* React
* TypeScript
* Vite

The frontend is responsible for:

* Displaying budget plans
* Creating and editing budget plans
* Managing income sources
* Managing expenses
* Managing savings goals
* Showing calculated budget summaries
* Displaying AI-assisted advisory reviews
* Handling form validation at the UI level
* Communicating with the backend through REST API calls

The frontend should not directly access the database.

### 4.2 Backend

The backend will be built using:

* Node.js
* Express
* TypeScript

The backend is responsible for:

* Exposing REST API endpoints
* Validating incoming requests
* Communicating with the database through Prisma
* Running budget calculation logic
* Generating rule-based advisory fallback responses
* Sending structured data to the AI service
* Returning budget summaries and advisory reviews to the frontend

The backend should contain the main business logic so calculations remain consistent and testable.

### 4.3 Database

The database will use:

* PostgreSQL
* Prisma ORM

The database is responsible for storing:

* Budget plans
* Income sources
* Expenses
* Savings goals
* Advisory reviews

PostgreSQL is selected because it is reliable, widely used, suitable for relational financial data, and valuable for professional software development experience.

### 4.4 AI Advisory Layer

The AI advisory layer will generate plain-English feedback based on structured budget summary data.

The AI will receive calculated values such as:

* Total income
* Total expenses
* Total savings goals
* Remaining buffer
* Expense-to-income ratio
* Savings rate
* Budget health status
* Fixed versus flexible expenses

The AI must only provide budgeting guidance and general planning suggestions.

The AI must not provide:

* Investment advice
* Tax advice
* Loan recommendations
* Credit product recommendations
* Instructions to transfer money
* Regulated financial advice

### 4.5 Rule-Based Fallback

PayPilot will include rule-based advisory logic so the app can still provide useful feedback if the AI service is unavailable.

Example rules:

```text
If remaining buffer is less than 0:
  Budget status = Over Budget

If remaining buffer is greater than or equal to 0 but less than 10% of income:
  Budget status = Tight

If remaining buffer is greater than or equal to 10% of income:
  Budget status = Healthy
```

This fallback improves reliability and keeps the project functional even without the AI API.

## 5. Data Flow

### 5.1 Creating a Budget Plan

```text
User submits budget plan form
        |
Frontend sends POST request
        |
Backend validates request
        |
Backend saves budget plan using Prisma
        |
PostgreSQL stores budget plan
        |
Backend returns created budget plan
        |
Frontend updates UI
```

### 5.2 Adding Income, Expenses, and Savings Goals

```text
User adds financial item
        |
Frontend sends API request
        |
Backend validates item
        |
Backend saves item to database
        |
Backend recalculates budget summary
        |
Frontend displays updated budget data
```

### 5.3 Generating Advisory Review

```text
User requests advisory review
        |
Frontend calls advisory endpoint
        |
Backend retrieves budget plan data
        |
Backend calculates budget summary
        |
Backend creates rule-based fallback advice
        |
Backend sends structured summary to AI service
        |
AI returns plain-English advisory review
        |
Backend stores advisory review
        |
Frontend displays advisory review
```

## 6. API Layer

The backend will expose REST API endpoints.

### Budget Plans

```text
GET    /api/budget-plans
POST   /api/budget-plans
GET    /api/budget-plans/:id
PUT    /api/budget-plans/:id
DELETE /api/budget-plans/:id
```

### Income Sources

```text
POST   /api/budget-plans/:id/income
PUT    /api/income/:incomeId
DELETE /api/income/:incomeId
```

### Expenses

```text
POST   /api/budget-plans/:id/expenses
PUT    /api/expenses/:expenseId
DELETE /api/expenses/:expenseId
```

### Savings Goals

```text
POST   /api/budget-plans/:id/savings-goals
PUT    /api/savings-goals/:goalId
DELETE /api/savings-goals/:goalId
```

### Budget Analysis

```text
GET    /api/budget-plans/:id/summary
POST   /api/budget-plans/:id/advisory-review
```

## 7. Business Logic

Budget calculations should be isolated from route handlers.

Recommended structure:

```text
server/
  src/
    modules/
      budgetPlans/
      income/
      expenses/
      savingsGoals/
      analysis/
      advisory/
```

The analysis module should calculate:

```text
totalIncome
totalExpenses
totalFixedExpenses
totalFlexibleExpenses
totalSavingsGoals
remainingBuffer
expenseToIncomeRatio
savingsRate
budgetHealthStatus
```

This separation makes the calculation logic easier to test and maintain.

## 8. Database Access

The backend will use Prisma Client to interact with PostgreSQL.

Route handlers should not contain raw SQL in the MVP.

Prisma will handle:

* Model definitions
* Database migrations
* Type-safe database access
* Relationships between budget plans and financial items

## 9. Security Considerations

The MVP will follow these security principles:

1. No bank account linking.
2. No storage of bank credentials.
3. No card numbers.
4. No automatic money movement.
5. API keys stored in environment variables.
6. Backend validation for all important fields.
7. AI prompts should use structured financial summaries, not unnecessary personal information.
8. Sensitive configuration files must not be committed to GitHub.

## 10. Environment Variables

The project should use environment variables for sensitive configuration.

Example backend environment variables:

```text
DATABASE_URL=
OPENAI_API_KEY=
PORT=
NODE_ENV=
```

Example frontend environment variables:

```text
VITE_API_BASE_URL=
```

The `.env` file must be included in `.gitignore`.

An `.env.example` file should be committed to GitHub.

## 11. Deployment Plan

### Frontend Deployment

The frontend can be deployed using:

* Vercel

### Backend Deployment

The backend can be deployed using:

* Render
* Railway

### Database Hosting

The PostgreSQL database can be hosted using:

* Neon
* Supabase
* Railway

### Recommended MVP Deployment

```text
Frontend: Vercel
Backend: Render
Database: Neon PostgreSQL
```

This setup is simple, professional, and suitable for a portfolio project.

## 12. Testing Strategy

### Frontend Testing

Use Vitest for:

* Calculation display logic
* Form validation helpers
* Component-level logic where appropriate

### Backend Testing

Use Jest or Supertest for:

* API endpoint testing
* Request validation
* Budget calculation logic
* Advisory fallback logic

### Highest Priority Tests

The most important tests should cover:

1. Remaining buffer calculation.
2. Budget health status classification.
3. Expense-to-income ratio calculation.
4. Savings rate calculation.
5. Backend validation for invalid amounts and dates.

## 13. Error Handling

The backend should return clear error messages for:

* Missing required fields
* Invalid dates
* Negative or zero amounts
* Budget plan not found
* Database errors
* AI service failure

If the AI service fails, PayPilot should still return rule-based fallback advice.

## 14. Architecture Decisions

### Decision 1: Monorepo Structure

PayPilot will use a monorepo structure to keep frontend, backend, and documentation in one repository.

Reason:

* Easier to manage as a solo developer
* Cleaner GitHub presentation
* Shared project documentation
* Suitable for a portfolio project

### Decision 2: REST API Instead of GraphQL

PayPilot will use REST APIs for the MVP.

Reason:

* Simpler to implement
* Easier to test
* More suitable for CRUD-heavy MVP features
* Easier for recruiters and reviewers to understand quickly

### Decision 3: PostgreSQL Instead of NoSQL

PayPilot will use PostgreSQL.

Reason:

* Budget plans, income, expenses, and savings goals are relational data
* PostgreSQL is widely used in industry
* Prisma works well with PostgreSQL
* Strong resume value

### Decision 4: Rule-Based Advice Before AI

PayPilot will include rule-based advisory logic before relying fully on AI.

Reason:

* Makes the app reliable without AI
* Easier to test
* Avoids unnecessary AI dependency
* Provides fallback if API fails

### Decision 5: No Bank Linking in MVP

PayPilot will not connect to bank accounts in the MVP.

Reason:

* Reduces security risk
* Avoids financial data compliance complexity
* Keeps the project focused
* Makes the app safer and easier to deploy

## 15. Future Architecture Enhancements

Possible future improvements include:

* User authentication
* Role-based access
* Saved budget history per user
* Charts and visual analytics
* Recurring expenses
* CSV import/export
* PDF reports
* AI chat interface
* Background jobs for reminders
* More advanced prompt safety layer

These are not part of the MVP.

## 16. Summary

PayPilot uses a simple but professional full-stack architecture:

```text
React + TypeScript frontend
Node.js + Express + TypeScript backend
PostgreSQL database
Prisma ORM
AI advisory layer
Rule-based fallback logic
```

The system is intentionally designed to be clear, maintainable, deployable, and suitable for a resume-quality software engineering portfolio project.
