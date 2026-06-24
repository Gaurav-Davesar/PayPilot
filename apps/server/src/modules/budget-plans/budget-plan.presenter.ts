import type { Prisma } from "@prisma/client";

const budgetPlanInclude = {
  incomeSources: {
    select: {
      amount: true,
    },
  },
  expenses: {
    select: {
      amount: true,
    },
  },
  savingsGoals: {
    select: {
      targetAmount: true,
    },
  },
} satisfies Prisma.BudgetPlanInclude;

export type BudgetPlanWithFinancialItems = Prisma.BudgetPlanGetPayload<{
  include: typeof budgetPlanInclude;
}>;

export const budgetPlanWithFinancialItems = budgetPlanInclude;

const total = (values: Array<{ amount: { toNumber(): number } }>) =>
  values.reduce((sum, item) => sum + item.amount.toNumber(), 0);

export function presentBudgetPlan(plan: BudgetPlanWithFinancialItems) {
  const totalIncome = total(plan.incomeSources);
  const totalExpenses = total(plan.expenses);
  const totalSavingsGoals = plan.savingsGoals.reduce(
    (sum, goal) => sum + goal.targetAmount.toNumber(),
    0,
  );
  const remainingBuffer = totalIncome - totalExpenses - totalSavingsGoals;
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
    summary: {
      totalIncome,
      totalExpenses,
      totalSavingsGoals,
      remainingBuffer,
      budgetStatus,
    },
  };
}
