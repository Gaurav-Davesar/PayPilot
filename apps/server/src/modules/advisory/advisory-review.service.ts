import type { BudgetStatus, ReviewType } from "@prisma/client";
import type { BudgetPlanWithFinancialItems } from "../budget-plans/budget-plan.presenter";
import { presentBudgetPlan } from "../budget-plans/budget-plan.presenter";

interface AdvisoryReviewDraft {
  status: BudgetStatus;
  summary: string;
  riskFactor: string | null;
  positiveObservation: string | null;
  suggestedAdjustment: string | null;
  reviewType: ReviewType;
}

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 2,
});

function money(value: number) {
  return currencyFormatter.format(value);
}

function percent(value: number | null) {
  return value === null ? "not available" : `${Math.round(value * 100)}%`;
}

function hasFinancialInputs(plan: ReturnType<typeof presentBudgetPlan>) {
  return plan.incomeSources.length + plan.expenses.length + plan.savingsGoals.length > 0;
}

function getPositiveObservation(plan: ReturnType<typeof presentBudgetPlan>) {
  const { summary } = plan;

  if (!hasFinancialInputs(plan)) {
    return "The plan timeframe is set up and ready for income, expenses, and savings goals.";
  }

  if (summary.totalIncome > 0 && summary.savingsRate !== null && summary.savingsRate >= 0.1) {
    return `This plan protects ${percent(summary.savingsRate)} of projected income for savings goals.`;
  }

  if (summary.totalIncome > 0 && summary.remainingBuffer >= summary.totalIncome * 0.1) {
    return `This plan keeps a buffer of ${money(summary.remainingBuffer)} after planned expenses and savings goals.`;
  }

  if (plan.incomeSources.length > 1) {
    return "This plan includes multiple income sources, which gives the budget health calculation more context.";
  }

  if (plan.expenses.length > 0) {
    return "Planned expenses are captured in the timeline, which makes the cash-flow picture easier to reason about.";
  }

  return "The plan has enough structure for PayPilot to start producing useful cash-flow observations.";
}

function getRiskFactor(plan: ReturnType<typeof presentBudgetPlan>) {
  const { summary } = plan;
  const hasOutflows = summary.totalExpenses + summary.totalSavingsGoals > 0;

  if (!hasFinancialInputs(plan)) {
    return "No financial inputs have been added yet, so the review is based only on the plan timeframe.";
  }

  if (summary.totalIncome === 0 && hasOutflows) {
    return "This plan has planned outflows but no projected income recorded.";
  }

  if (summary.remainingBuffer < 0) {
    return `Planned expenses and savings goals exceed projected income by ${money(Math.abs(summary.remainingBuffer))}.`;
  }

  if (summary.totalIncome > 0 && summary.remainingBuffer < summary.totalIncome * 0.1) {
    return `The remaining buffer is ${money(summary.remainingBuffer)}, which is below 10% of projected income.`;
  }

  if (summary.expenseToIncomeRatio !== null && summary.expenseToIncomeRatio > 0.75) {
    return `Planned expenses use ${percent(summary.expenseToIncomeRatio)} of projected income before savings goals.`;
  }

  if (summary.totalIncome > 0 && summary.totalFixedExpenses > summary.totalIncome * 0.6) {
    return "Fixed expenses take up more than 60% of projected income, leaving less flexibility if the plan changes.";
  }

  return null;
}

function getSuggestedAdjustment(plan: ReturnType<typeof presentBudgetPlan>) {
  const { summary } = plan;
  const targetBuffer = summary.totalIncome * 0.1;
  const bufferGap = Math.max(0, targetBuffer - summary.remainingBuffer);

  if (!hasFinancialInputs(plan)) {
    return "Add at least one income source and one planned expense to generate a more useful advisory review.";
  }

  if (summary.totalIncome === 0 && summary.totalExpenses + summary.totalSavingsGoals > 0) {
    return "Add projected income for this timeframe, or reduce planned outflows until the plan has a visible funding source.";
  }

  if (summary.remainingBuffer < 0) {
    const overBudgetAmount = Math.abs(summary.remainingBuffer);
    if (summary.totalFlexibleExpenses > 0) {
      return `Review flexible expenses first. Reducing them by about ${money(Math.min(overBudgetAmount, summary.totalFlexibleExpenses))} would help move the plan back toward balance.`;
    }

    return "Review planned expenses and savings goals, then reduce or reschedule items until projected income covers the plan.";
  }

  if (bufferGap > 0) {
    if (summary.totalFlexibleExpenses > 0) {
      return `Consider trimming or rescheduling about ${money(Math.min(bufferGap, summary.totalFlexibleExpenses))} from flexible expenses to rebuild a safer cash-flow buffer.`;
    }

    return "Consider lowering or rescheduling savings goals slightly to preserve a safer cash-flow buffer.";
  }

  if (summary.expenseToIncomeRatio !== null && summary.expenseToIncomeRatio > 0.7) {
    return "Keep an eye on expense growth. If new costs appear, compare flexible categories before changing savings goals.";
  }

  return "Keep the plan updated as dates or amounts change, and regenerate the review after meaningful edits.";
}

function getSummary(plan: ReturnType<typeof presentBudgetPlan>) {
  const { summary } = plan;

  if (!hasFinancialInputs(plan)) {
    return "This budget plan is ready for inputs. Add projected income, planned expenses, and savings goals to receive a more specific cash-flow review.";
  }

  if (summary.budgetStatus === "OVER_BUDGET") {
    return `This plan is over budget. Projected income is ${money(summary.totalIncome)}, while planned expenses and savings goals total ${money(summary.totalExpenses + summary.totalSavingsGoals)}.`;
  }

  if (summary.budgetStatus === "TIGHT") {
    return `This plan is possible but tight. After expenses and savings goals, the remaining buffer is ${money(summary.remainingBuffer)}.`;
  }

  return `This plan looks healthy from a cash-flow planning perspective. It leaves a projected buffer of ${money(summary.remainingBuffer)} after planned expenses and savings goals.`;
}

export function generateRuleBasedAdvisoryReview(
  planWithFinancialItems: BudgetPlanWithFinancialItems,
): AdvisoryReviewDraft {
  const plan = presentBudgetPlan(planWithFinancialItems);

  return {
    status: plan.summary.budgetStatus as BudgetStatus,
    summary: getSummary(plan),
    riskFactor: getRiskFactor(plan),
    positiveObservation: getPositiveObservation(plan),
    suggestedAdjustment: getSuggestedAdjustment(plan),
    reviewType: "RULE_BASED",
  };
}
