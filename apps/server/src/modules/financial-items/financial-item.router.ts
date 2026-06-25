import { Router } from "express";
import { prisma } from "../../lib/prisma";
import {
  budgetPlanWithFinancialItems,
  presentBudgetPlan,
} from "../budget-plans/budget-plan.presenter";
import {
  validateCreateExpense,
  validateCreateIncomeSource,
  validateCreateSavingsGoal,
  validateUpdateExpense,
  validateUpdateIncomeSource,
  validateUpdateSavingsGoal,
} from "./financial-item.validation";

export const financialItemRouter = Router();

async function budgetPlanExists(id: string) {
  const plan = await prisma.budgetPlan.findUnique({
    where: { id },
    select: { id: true },
  });

  return Boolean(plan);
}

async function touchAndReadBudgetPlan(id: string) {
  return prisma.budgetPlan.update({
    where: { id },
    data: { updatedAt: new Date() },
    include: budgetPlanWithFinancialItems,
  });
}

financialItemRouter.post("/budget-plans/:id/income", async (req, res, next) => {
  const validation = validateCreateIncomeSource(req.body);
  if ("error" in validation) {
    res.status(400).json(validation);
    return;
  }

  try {
    const exists = await budgetPlanExists(req.params.id);
    if (!exists) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    await prisma.incomeSource.create({
      data: {
        budgetPlanId: req.params.id,
        ...validation.data,
      },
    });

    const plan = await touchAndReadBudgetPlan(req.params.id);
    res.status(201).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.put("/income/:incomeId", async (req, res, next) => {
  try {
    const existing = await prisma.incomeSource.findUnique({
      where: { id: req.params.incomeId },
      select: {
        budgetPlanId: true,
        name: true,
        amount: true,
        expectedDate: true,
        frequency: true,
        customDates: true,
        notes: true,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Income source not found." });
      return;
    }

    const validation = validateUpdateIncomeSource(req.body, {
      name: existing.name,
      amount: existing.amount.toString(),
      expectedDate: existing.expectedDate,
      frequency: existing.frequency,
      customDates: existing.customDates,
      notes: existing.notes,
    });
    if ("error" in validation) {
      res.status(400).json(validation);
      return;
    }

    await prisma.incomeSource.update({
      where: { id: req.params.incomeId },
      data: validation.data,
    });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.delete("/income/:incomeId", async (req, res, next) => {
  try {
    const existing = await prisma.incomeSource.findUnique({
      where: { id: req.params.incomeId },
      select: { budgetPlanId: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Income source not found." });
      return;
    }

    await prisma.incomeSource.delete({ where: { id: req.params.incomeId } });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.post("/budget-plans/:id/expenses", async (req, res, next) => {
  const validation = validateCreateExpense(req.body);
  if ("error" in validation) {
    res.status(400).json(validation);
    return;
  }

  try {
    const exists = await budgetPlanExists(req.params.id);
    if (!exists) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    await prisma.expense.create({
      data: {
        budgetPlanId: req.params.id,
        ...validation.data,
      },
    });

    const plan = await touchAndReadBudgetPlan(req.params.id);
    res.status(201).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.put("/expenses/:expenseId", async (req, res, next) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.expenseId },
      select: {
        budgetPlanId: true,
        name: true,
        amount: true,
        category: true,
        type: true,
        dueDate: true,
        frequency: true,
        customDates: true,
        notes: true,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Expense not found." });
      return;
    }

    const validation = validateUpdateExpense(req.body, {
      name: existing.name,
      amount: existing.amount.toString(),
      category: existing.category,
      type: existing.type,
      dueDate: existing.dueDate,
      frequency: existing.frequency,
      customDates: existing.customDates,
      notes: existing.notes,
    });
    if ("error" in validation) {
      res.status(400).json(validation);
      return;
    }

    await prisma.expense.update({
      where: { id: req.params.expenseId },
      data: validation.data,
    });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.delete("/expenses/:expenseId", async (req, res, next) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.expenseId },
      select: { budgetPlanId: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Expense not found." });
      return;
    }

    await prisma.expense.delete({ where: { id: req.params.expenseId } });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.post("/budget-plans/:id/savings-goals", async (req, res, next) => {
  const validation = validateCreateSavingsGoal(req.body);
  if ("error" in validation) {
    res.status(400).json(validation);
    return;
  }

  try {
    const exists = await budgetPlanExists(req.params.id);
    if (!exists) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    await prisma.savingsGoal.create({
      data: {
        budgetPlanId: req.params.id,
        ...validation.data,
      },
    });

    const plan = await touchAndReadBudgetPlan(req.params.id);
    res.status(201).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.put("/savings-goals/:goalId", async (req, res, next) => {
  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id: req.params.goalId },
      select: {
        budgetPlanId: true,
        name: true,
        targetAmount: true,
        priority: true,
        notes: true,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Savings goal not found." });
      return;
    }

    const validation = validateUpdateSavingsGoal(req.body, {
      name: existing.name,
      targetAmount: existing.targetAmount.toString(),
      priority: existing.priority,
      notes: existing.notes,
    });
    if ("error" in validation) {
      res.status(400).json(validation);
      return;
    }

    await prisma.savingsGoal.update({
      where: { id: req.params.goalId },
      data: validation.data,
    });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

financialItemRouter.delete("/savings-goals/:goalId", async (req, res, next) => {
  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id: req.params.goalId },
      select: { budgetPlanId: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Savings goal not found." });
      return;
    }

    await prisma.savingsGoal.delete({ where: { id: req.params.goalId } });

    const plan = await touchAndReadBudgetPlan(existing.budgetPlanId);
    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});
