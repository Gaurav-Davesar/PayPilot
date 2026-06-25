import type { Prisma } from "@prisma/client";

const budgetPlanInclude = {
  incomeSources: {
    select: {
      id: true,
      name: true,
      amount: true,
      expectedDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  expenses: {
    select: {
      id: true,
      name: true,
      amount: true,
      category: true,
      type: true,
      dueDate: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  savingsGoals: {
    select: {
      id: true,
      name: true,
      targetAmount: true,
      priority: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.BudgetPlanInclude;

export type BudgetPlanWithFinancialItems = Prisma.BudgetPlanGetPayload<{
  include: typeof budgetPlanInclude;
}>;

export const budgetPlanWithFinancialItems = budgetPlanInclude;

const total = (values: Array<{ amount: { toNumber(): number } }>) =>
  values.reduce((sum, item) => sum + item.amount.toNumber(), 0);

const formatNullableDate = (value: Date | null) => (value ? value.toISOString() : null);

export function presentBudgetPlan(plan: BudgetPlanWithFinancialItems) {
  const totalIncome = total(plan.incomeSources);
  const totalExpenses = total(plan.expenses);
  const totalFixedExpenses = plan.expenses.reduce(
    (sum, expense) => sum + (expense.type === "FIXED" ? expense.amount.toNumber() : 0),
    0,
  );
  const totalFlexibleExpenses = totalExpenses - totalFixedExpenses;
  const totalSavingsGoals = plan.savingsGoals.reduce(
    (sum, goal) => sum + goal.targetAmount.toNumber(),
    0,
  );
  const remainingBuffer = totalIncome - totalExpenses - totalSavingsGoals;
  const expenseToIncomeRatio = totalIncome > 0 ? totalExpenses / totalIncome : null;
  const savingsRate = totalIncome > 0 ? totalSavingsGoals / totalIncome : null;
  const budgetStatus =
    remainingBuffer < 0
      ? "OVER_BUDGET"
      : totalIncome > 0 && remainingBuffer < totalIncome * 0.1
        ? "TIGHT"
        : "HEALTHY";

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    startDate: plan.startDate.toISOString(),
    endDate: plan.endDate.toISOString(),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    incomeSources: plan.incomeSources.map((incomeSource) => ({
      id: incomeSource.id,
      name: incomeSource.name,
      amount: incomeSource.amount.toNumber(),
      expectedDate: formatNullableDate(incomeSource.expectedDate),
      notes: incomeSource.notes,
      createdAt: incomeSource.createdAt.toISOString(),
      updatedAt: incomeSource.updatedAt.toISOString(),
    })),
    expenses: plan.expenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount.toNumber(),
      category: expense.category,
      type: expense.type,
      dueDate: formatNullableDate(expense.dueDate),
      notes: expense.notes,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    })),
    savingsGoals: plan.savingsGoals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount.toNumber(),
      priority: goal.priority,
      notes: goal.notes,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    })),
    summary: {
      totalIncome,
      totalExpenses,
      totalFixedExpenses,
      totalFlexibleExpenses,
      totalSavingsGoals,
      remainingBuffer,
      expenseToIncomeRatio,
      savingsRate,
      budgetStatus,
    },
  };
}
