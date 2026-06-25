# PayPilot MVP Requirements

## 1. MVP Goal

The goal of the PayPilot MVP is to build a working AI-assisted cash-flow planning web application where users can create budget plans for custom timelines, enter income, expenses, and savings goals, and receive a structured budget analysis with advisory insights.

The MVP should prove the core product idea:

**Users can plan their money for a selected time period and understand whether the plan is healthy, tight, or risky.**

## 2. MVP Success Statement

The MVP is complete when a user can:

1. Create a budget plan with a title, start date, and end date.
2. Add income sources to the plan.
3. Add planned expenses to the plan.
4. Add savings goals to the plan.
5. View calculated totals and remaining buffer.
6. View a budget health status.
7. Receive an AI-assisted advisory review explaining risks and possible improvements.

## 3. Target User

The initial target user is someone who wants to plan cash flow across a custom timeline without connecting bank accounts.

Examples include:

* A student planning monthly expenses
* A casual worker planning income between pay cycles
* A young professional budgeting for rent, bills, and savings
* A user planning for a short-term financial goal
* A user preparing for travel, events, or major upcoming expenses

## 4. Core User Stories

### Budget Plan Management

As a user, I want to create a budget plan for a custom time period so that I can plan my income and expenses for that period.

As a user, I want to view all my budget plans so that I can access previous or current plans.

As a user, I want to edit a budget plan so that I can update the title, dates, or description.

As a user, I want to delete a budget plan so that I can remove plans I no longer need.

### Income Management

As a user, I want to add income sources to a budget plan so that I can calculate the money available for that period.

As a user, I want to edit income sources so that I can correct or update expected income.

As a user, I want to delete income sources so that incorrect entries do not affect my budget.

### Expense Management

As a user, I want to add planned expenses so that I can see how much money will be spent during the selected period.

As a user, I want to categorise expenses so that I can understand where my money is going.

As a user, I want to mark expenses as fixed or flexible so that PayPilot can identify areas where adjustments may be possible.

As a user, I want to edit and delete expenses so that my plan remains accurate.

### Savings Goal Management

As a user, I want to add savings goals so that I can include planned savings in my cash-flow calculation.

As a user, I want to edit or delete savings goals so that I can adjust my plan when needed.

### Budget Analysis

As a user, I want PayPilot to calculate total income, total expenses, total savings goals, and remaining buffer so that I can understand my financial position.

As a user, I want to see a budget health status so that I can quickly understand whether my plan is healthy, tight, or over budget.

As a user, I want to receive advisory insights so that I can understand what changes may improve my plan.

## 5. Functional Requirements

### FR1: Create Budget Plan

The system must allow users to create a budget plan with:

* Title
* Optional description
* Start date
* End date

Validation rules:

* Title is required.
* Start date is required.
* End date is required.
* End date must be after start date.

### FR2: View Budget Plans

The system must display a list of existing budget plans.

Each plan should show:

* Title
* Date range
* Total income
* Total expenses
* Total savings goals
* Remaining buffer
* Budget health status

### FR3: Update Budget Plan

The system must allow users to update the title, description, start date, and end date of a budget plan.

### FR4: Delete Budget Plan

The system must allow users to delete a budget plan.

When a budget plan is deleted, its related income sources, expenses, and savings goals should also be removed.

### FR5: Add Income Source

The system must allow users to add income sources to a budget plan.

Each income source should include:

* Name
* Amount
* Optional expected date
* Frequency: one-time, weekly, fortnightly, monthly, or custom dates
* Optional notes

Validation rules:

* Name is required.
* Amount is required.
* Amount must be greater than zero.
* Custom frequency requires at least one valid custom date.

### FR6: Manage Income Sources

The system must allow users to view, update, and delete income sources linked to a budget plan.

### FR7: Add Expense

The system must allow users to add expenses to a budget plan.

Each expense should include:

* Name
* Amount
* Category
* Expense type: fixed or flexible
* Optional due date
* Frequency: one-time, weekly, fortnightly, monthly, or custom dates
* Optional notes

Validation rules:

* Name is required.
* Amount is required.
* Amount must be greater than zero.
* Category is required.
* Expense type is required.
* Custom frequency requires at least one valid custom date.

### FR8: Manage Expenses

The system must allow users to view, update, and delete expenses linked to a budget plan.

### FR9: Add Savings Goal

The system must allow users to add savings goals to a budget plan.

Each savings goal should include:

* Goal name
* Target amount
* Optional priority level
* Optional notes

Validation rules:

* Goal name is required.
* Target amount is required.
* Target amount must be greater than zero.

### FR10: Manage Savings Goals

The system must allow users to view, update, and delete savings goals linked to a budget plan.

### FR11: Calculate Budget Summary

The system must calculate:

* Total income
* Total expenses
* Total fixed expenses
* Total flexible expenses
* Total savings goals
* Remaining buffer
* Expense-to-income ratio
* Savings rate
* Budget health status

Formula examples:

```text
remaining_buffer = total_income - total_expenses - total_savings_goals
expense_to_income_ratio = total_expenses / total_income
savings_rate = total_savings_goals / total_income
```

### FR12: Determine Budget Health Status

The system must classify a budget plan into one of the following statuses:

* Healthy
* Tight
* Over Budget

Suggested MVP rules:

```text
If remaining_buffer < 0:
  status = "Over Budget"

Else if remaining_buffer < 10% of total income:
  status = "Tight"

Else:
  status = "Healthy"
```

### FR13: Generate Advisory Review

The system must generate a structured advisory review based on the budget summary.

The advisory review should include:

* Overall budget status
* Main risk factor
* Positive observation
* Suggested adjustment
* Short plain-English explanation

Example output:

```text
Status: Tight

Your plan is possible, but your remaining buffer is low. After expenses and savings goals, only 7% of your income remains available. Consider reducing flexible expenses or lowering your savings goal slightly to keep a safer cash-flow buffer.
```

### FR14: Rule-Based Fallback Advice

The system should include rule-based advisory logic so that PayPilot can generate basic advice even if the AI service is unavailable.

### FR15: AI-Assisted Advice

The system should send structured budget summary data to an AI service and receive a plain-English advisory response.

The AI response should not provide regulated financial advice, investment recommendations, tax advice, loan recommendations, or instructions to move money.

## 6. Non-Functional Requirements

### NFR1: Security

The MVP must not store bank account credentials, card numbers, or sensitive financial login details.

The app must not move money or connect directly to bank accounts.

Environment variables must be used for API keys and database credentials.

### NFR2: Privacy

User-entered budget data should only be used for generating budget analysis.

No unnecessary personal information should be collected in the MVP.

### NFR3: Performance

Budget calculations should return quickly for normal personal-use data volumes.

The MVP should comfortably handle:

* Up to 50 budget plans
* Up to 100 expenses per plan
* Up to 20 income sources per plan
* Up to 20 savings goals per plan

### NFR4: Reliability

The app should handle invalid input gracefully and show useful error messages.

The backend should validate all important fields before saving data.

### NFR5: Maintainability

The codebase should use TypeScript across the frontend and backend.

The project should follow a clear folder structure.

Business logic such as budget calculations and advisory rules should be separated from UI components.

### NFR6: Documentation

The GitHub repository should include:

* README
* Project brief
* MVP requirements
* Architecture document
* Database schema document
* Setup instructions
* API documentation

## 7. MVP Screens

### Screen 1: Dashboard

Purpose:

Display all budget plans and show a high-level summary.

Main elements:

* Create new budget plan button
* List of budget plans
* Budget health status for each plan
* Date range for each plan
* Remaining buffer for each plan

### Screen 2: Create/Edit Budget Plan

Purpose:

Allow users to create or update a budget plan.

Main fields:

* Title
* Description
* Start date
* End date

### Screen 3: Budget Plan Detail

Purpose:

Show all information for a selected budget plan.

Main sections:

* Budget summary
* Income sources
* Expenses
* Savings goals
* Advisory review

### Screen 4: Add/Edit Income Source

Purpose:

Allow users to add or update income sources.

Main fields:

* Name
* Amount
* Expected date
* Notes

### Screen 5: Add/Edit Expense

Purpose:

Allow users to add or update expenses.

Main fields:

* Name
* Amount
* Category
* Fixed or flexible
* Due date
* Notes

### Screen 6: Add/Edit Savings Goal

Purpose:

Allow users to add or update savings goals.

Main fields:

* Goal name
* Target amount
* Priority
* Notes

## 8. API Requirements

### Budget Plans

```text
GET /api/budget-plans
POST /api/budget-plans
GET /api/budget-plans/:id
PUT /api/budget-plans/:id
DELETE /api/budget-plans/:id
```

### Income Sources

```text
POST /api/budget-plans/:id/income
PUT /api/income/:incomeId
DELETE /api/income/:incomeId
```

### Expenses

```text
POST /api/budget-plans/:id/expenses
PUT /api/expenses/:expenseId
DELETE /api/expenses/:expenseId
```

### Savings Goals

```text
POST /api/budget-plans/:id/savings-goals
PUT /api/savings-goals/:goalId
DELETE /api/savings-goals/:goalId
```

### Analysis

```text
GET /api/budget-plans/:id/summary
POST /api/budget-plans/:id/advisory-review
```

## 9. Data Models

### BudgetPlan

```text
id
title
description
startDate
endDate
createdAt
updatedAt
```

### IncomeSource

```text
id
budgetPlanId
name
amount
expectedDate
notes
createdAt
updatedAt
```

### Expense

```text
id
budgetPlanId
name
amount
category
type
dueDate
notes
createdAt
updatedAt
```

### SavingsGoal

```text
id
budgetPlanId
name
targetAmount
priority
notes
createdAt
updatedAt
```

### AdvisoryReview

```text
id
budgetPlanId
status
summary
riskFactor
positiveObservation
suggestedAdjustment
createdAt
updatedAt
```

## 10. Excluded Features

The following features are not part of the MVP:

* User authentication
* Bank linking
* Real transaction syncing
* Automatic payments
* Investment advice
* Tax advice
* Loan advice
* Credit score analysis
* Financial product recommendations
* Receipt scanning
* Mobile app
* Multi-currency support
* Real-time notifications
* Shared budgets
* PDF export
* CSV import/export
* Advanced charts

## 11. Future Features

Potential post-MVP features include:

* User authentication
* Budget history
* Charts and trend analysis
* Recurring expenses
* Multiple budget scenarios
* Export to PDF or CSV
* Goal progress tracking
* AI chat interface
* Budget comparison across time periods
* Notifications and reminders
* Shared household budgets

## 12. MVP Build Milestones

### Milestone 1: Project Foundation

Done when:

* GitHub repository is created
* README is created
* Project documentation folder is created
* Frontend app runs locally
* Backend app runs locally
* Health-check API endpoint works
* Database schema is drafted

### Milestone 2: Budget Plan CRUD

Done when:

* User can create a budget plan
* User can view all budget plans
* User can view one budget plan
* User can update a budget plan
* User can delete a budget plan
* Budget plans are saved in PostgreSQL

### Milestone 3: Income, Expense, and Savings Inputs

Done when:

* User can add income sources
* User can add expenses
* User can add savings goals
* User can edit and delete each item type
* All items are linked to a budget plan

### Milestone 4: Budget Analysis Engine

Done when:

* Total income is calculated
* Total expenses are calculated
* Total savings goals are calculated
* Remaining buffer is calculated
* Expense-to-income ratio is calculated
* Savings rate is calculated
* Budget health status is generated

### Milestone 5: Advisory Review

Done when:

* Rule-based advice is generated from the budget summary
* AI-assisted advice is generated from the budget summary
* The app prevents unsafe financial advice wording
* Advisory review is displayed in the UI

### Milestone 6: Deployment and Documentation

Done when:

* Frontend is deployed
* Backend is deployed
* Database is hosted
* Environment variables are configured
* README includes setup instructions
* API documentation is complete
* Screenshots are added to GitHub
