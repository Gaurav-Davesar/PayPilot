import { Router } from "express";
import { prisma } from "../../lib/prisma";
import {
  budgetPlanWithFinancialItems,
  presentBudgetPlan,
} from "./budget-plan.presenter";
import {
  validateCreateBudgetPlan,
  validateUpdateBudgetPlan,
} from "./budget-plan.validation";

export const budgetPlanRouter = Router();

budgetPlanRouter.get("/", async (_req, res, next) => {
  try {
    const plans = await prisma.budgetPlan.findMany({
      include: budgetPlanWithFinancialItems,
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.status(200).json({ data: plans.map(presentBudgetPlan) });
  } catch (error) {
    next(error);
  }
});

budgetPlanRouter.post("/", async (req, res, next) => {
  const validation = validateCreateBudgetPlan(req.body);
  if ("error" in validation) {
    res.status(400).json(validation);
    return;
  }

  try {
    const plan = await prisma.budgetPlan.create({
      data: validation.data,
      include: budgetPlanWithFinancialItems,
    });

    res.status(201).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

budgetPlanRouter.get("/:id", async (req, res, next) => {
  try {
    const plan = await prisma.budgetPlan.findUnique({
      where: { id: req.params.id },
      include: budgetPlanWithFinancialItems,
    });

    if (!plan) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

budgetPlanRouter.put("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.budgetPlan.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    const validation = validateUpdateBudgetPlan(req.body, existing);
    if ("error" in validation) {
      res.status(400).json(validation);
      return;
    }

    const plan = await prisma.budgetPlan.update({
      where: { id: existing.id },
      data: validation.data,
      include: budgetPlanWithFinancialItems,
    });

    res.status(200).json({ data: presentBudgetPlan(plan) });
  } catch (error) {
    next(error);
  }
});

budgetPlanRouter.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.budgetPlan.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    await prisma.budgetPlan.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
