import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { budgetPlanRouter } from "./modules/budget-plans/budget-plan.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "PayPilot API is running",
  });
});

app.use("/api/budget-plans", budgetPlanRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled API error", error);
    res.status(500).json({ error: "An unexpected server error occurred." });
  },
);

app.listen(PORT, () => {
  console.log(`PayPilot server running on port ${PORT}`);
});
