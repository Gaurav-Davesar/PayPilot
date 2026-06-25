import type { Prisma } from "@prisma/client";

const budgetPlanInclude = {
  incomeSources: {
    select: {
      id: true,
      name: true,
      amount: true,
      expectedDate: true,
      frequency: true,
      customDates: true,
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
      frequency: true,
      customDates: true,
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

const formatNullableDate = (value: Date | null) => (value ? value.toISOString() : null);

const MS_PER_DAY = 24 * 60 * 60 * 1_000;

type ScheduledItem = {
  amount: { toNumber(): number };
  frequency: "ONCE" | "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "CUSTOM";
  customDates: Date[];
};

function isWithinPlan(date: Date, plan: { startDate: Date; endDate: Date }) {
  return date >= plan.startDate && date <= plan.endDate;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  const originalDay = nextDate.getUTCDate();
  nextDate.setUTCDate(1);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0),
  ).getUTCDate();
  nextDate.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

  return nextDate;
}

function countRecurringOccurrences(
  anchorDate: Date | null,
  frequency: ScheduledItem["frequency"],
  plan: { startDate: Date; endDate: Date },
) {
  const firstOccurrence = anchorDate ?? plan.startDate;

  if (frequency === "ONCE") {
    return anchorDate && !isWithinPlan(anchorDate, plan) ? 0 : 1;
  }

  let occurrence = firstOccurrence;
  let count = 0;

  while (occurrence < plan.startDate) {
    occurrence =
      frequency === "MONTHLY"
        ? addMonths(occurrence, 1)
        : addDays(occurrence, frequency === "FORTNIGHTLY" ? 14 : 7);
  }

  while (occurrence <= plan.endDate) {
    count += 1;
    occurrence =
      frequency === "MONTHLY"
        ? addMonths(occurrence, 1)
        : addDays(occurrence, frequency === "FORTNIGHTLY" ? 14 : 7);
  }

  return count;
}

function getOccurrenceCount(
  item: ScheduledItem,
  anchorDate: Date | null,
  plan: { startDate: Date; endDate: Date },
) {
  if (item.frequency === "CUSTOM") {
    return item.customDates.filter((date) => isWithinPlan(date, plan)).length;
  }

  return countRecurringOccurrences(anchorDate, item.frequency, plan);
}

function projectedAmount(
  item: ScheduledItem,
  anchorDate: Date | null,
  plan: { startDate: Date; endDate: Date },
) {
  return item.amount.toNumber() * getOccurrenceCount(item, anchorDate, plan);
}

export function presentBudgetPlan(plan: BudgetPlanWithFinancialItems) {
  const totalIncome = plan.incomeSources.reduce(
    (sum, incomeSource) => sum + projectedAmount(incomeSource, incomeSource.expectedDate, plan),
    0,
  );
  const totalExpenses = plan.expenses.reduce(
    (sum, expense) => sum + projectedAmount(expense, expense.dueDate, plan),
    0,
  );
  const totalFixedExpenses = plan.expenses.reduce(
    (sum, expense) =>
      sum + (expense.type === "FIXED" ? projectedAmount(expense, expense.dueDate, plan) : 0),
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
      ...(() => {
        const occurrenceCount = getOccurrenceCount(incomeSource, incomeSource.expectedDate, plan);

        return {
          occurrenceCount,
          projectedTotal: incomeSource.amount.toNumber() * occurrenceCount,
        };
      })(),
      id: incomeSource.id,
      name: incomeSource.name,
      amount: incomeSource.amount.toNumber(),
      expectedDate: formatNullableDate(incomeSource.expectedDate),
      frequency: incomeSource.frequency,
      customDates: incomeSource.customDates.map((date) => date.toISOString()),
      notes: incomeSource.notes,
      createdAt: incomeSource.createdAt.toISOString(),
      updatedAt: incomeSource.updatedAt.toISOString(),
    })),
    expenses: plan.expenses.map((expense) => ({
      ...(() => {
        const occurrenceCount = getOccurrenceCount(expense, expense.dueDate, plan);

        return {
          occurrenceCount,
          projectedTotal: expense.amount.toNumber() * occurrenceCount,
        };
      })(),
      id: expense.id,
      name: expense.name,
      amount: expense.amount.toNumber(),
      category: expense.category,
      type: expense.type,
      dueDate: formatNullableDate(expense.dueDate),
      frequency: expense.frequency,
      customDates: expense.customDates.map((date) => date.toISOString()),
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
