import { Router } from "express";
import { prisma } from "../../lib/prisma";
import {
  budgetPlanWithFinancialItems,
  presentBudgetPlan,
} from "../budget-plans/budget-plan.presenter";
import { generateRuleBasedAdvisoryReview } from "./advisory-review.service";

export const advisoryReviewRouter = Router();

advisoryReviewRouter.post("/:id/advisory-review", async (req, res, next) => {
  try {
    const existingPlan = await prisma.budgetPlan.findUnique({
      where: { id: req.params.id },
      include: budgetPlanWithFinancialItems,
    });

    if (!existingPlan) {
      res.status(404).json({ error: "Budget plan not found." });
      return;
    }

    const review = generateRuleBasedAdvisoryReview(existingPlan);

    await prisma.advisoryReview.create({
      data: {
        budgetPlanId: existingPlan.id,
        ...review,
      },
    });

    const updatedPlan = await prisma.budgetPlan.update({
      where: { id: existingPlan.id },
      data: { updatedAt: new Date() },
      include: budgetPlanWithFinancialItems,
    });

    res.status(201).json({ data: presentBudgetPlan(updatedPlan) });
  } catch (error) {
    next(error);
  }
});
