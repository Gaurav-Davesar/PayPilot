# PayPilot Project Brief

## Project Name

**PayPilot**

## Project Summary

PayPilot is an AI-assisted cash-flow planning web application that helps users create budget plans for custom timelines. Users can enter income sources, planned expenses, and savings goals, then receive a structured budget summary and advisory insights to improve their financial planning.

PayPilot does not control, move, or invest money. It is designed as a planning and advisory tool only.

## Problem Statement

Many people struggle to plan their money across different time periods such as weekly pay cycles, fortnightly wages, monthly bills, short-term savings goals, travel plans, or event budgets. Traditional budgeting tools often focus on tracking spending after it happens, while PayPilot focuses on planning before the money is spent.

The goal is to help users answer a simple question:

**“Can I afford this plan, and what adjustments would make it healthier?”**

## Target Users

PayPilot is designed for:

* Students managing income, bills, and savings
* Casual or part-time workers with variable income
* Young professionals planning monthly budgets
* Users saving toward short-term financial goals
* Anyone who wants a simple cash-flow planning tool without bank account linking

## Core Value Proposition

PayPilot helps users create a clear financial plan for a chosen time period and provides practical insights about whether the plan is healthy, tight, or risky.

Instead of only showing numbers, PayPilot explains the budget position in plain language and suggests realistic adjustments.

## MVP Scope

The MVP will allow users to:

1. Create a budget plan with a custom start date and end date.
2. Add one or more income sources.
3. Add planned expenses.
4. Add one or more savings goals.
5. Calculate total income, total expenses, total savings target, and remaining buffer.
6. Display a budget health status such as Healthy, Tight, or Over Budget.
7. Generate an AI-assisted advisory review based on the user’s budget data.

## Out of Scope for MVP

The MVP will not include:

* Bank account linking
* Automatic transactions
* Automatic money transfers
* Investment advice
* Tax advice
* Loan advice
* Credit score recommendations
* Financial product recommendations
* Receipt scanning
* Mobile app
* Real-time bank data
* Multi-currency support

These features are intentionally excluded to keep the project focused, safe, and achievable.

## Success Criteria

The MVP is complete when a user can create a custom budget plan, add income, expenses, and savings goals, view calculated budget results, and receive an AI-assisted review explaining the plan’s strengths, risks, and possible improvements.

## Example User Flow

1. User creates a new budget plan called “July Budget.”
2. User selects a custom date range from 1 July to 31 July.
3. User adds income sources such as salary, casual shifts, or freelance income.
4. User adds expenses such as rent, groceries, fuel, subscriptions, and bills.
5. User adds a savings goal.
6. PayPilot calculates the remaining spending buffer.
7. PayPilot displays the budget health status.
8. PayPilot generates advisory feedback such as:

“Your budget is possible but tight. Your planned expenses and savings goals leave only 7% of your income as a buffer. Consider reducing flexible expenses or adjusting the savings goal to maintain a safer cash-flow margin.”

## Proposed Tech Stack

### Frontend

React, TypeScript, Vite

### Backend

Node.js, Express, TypeScript

### Database

PostgreSQL

### ORM

Prisma

### AI Layer

OpenAI API or a similar LLM provider, with rule-based fallback logic

### Testing

Vitest for frontend logic
Jest or Supertest for backend API testing

### Deployment

Vercel for frontend
Render or Railway for backend
Neon or Supabase for PostgreSQL

## Key Technical Features

* Custom date range budget planning
* Income source management
* Expense categorisation
* Savings goal tracking
* Budget health calculations
* AI-assisted advisory insights
* REST API backend
* PostgreSQL relational database
* TypeScript-based full-stack codebase
* Professional GitHub documentation

## Ethical and Safety Position

PayPilot is not a financial advisor and does not provide regulated financial advice. It does not recommend investments, loans, credit products, or tax strategies. The application only provides general budgeting insights based on user-entered data.

Users remain fully responsible for their financial decisions.

## Future Enhancements

Possible future features include:

* User authentication
* Saved budget history
* Budget comparison across time periods
* Charts and visual summaries
* Recurring expenses
* Export to PDF or CSV
* AI chat interface for budget questions
* Notification reminders
* Goal progress tracking

## Resume Description

PayPilot is an AI-assisted cash-flow planning web application built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma. It allows users to create custom timeline budget plans, manage income and expenses, track savings goals, calculate budget health, and receive AI-generated advisory insights.
