export interface BudgetPlanInput {
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
}

type BudgetPlanSource = Partial<{
  title: unknown;
  description: unknown;
  startDate: unknown;
  endDate: unknown;
}>;

const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 1_000;

function asObject(value: unknown): BudgetPlanSource | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as BudgetPlanSource;
}

function parseTitle(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const title = value.trim();
  return title.length > 0 && title.length <= TITLE_MAX_LENGTH ? title : null;
}

function parseDescription(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const description = value.trim();
  return description.length <= DESCRIPTION_MAX_LENGTH ? description || null : undefined;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateDateRange(startDate: Date, endDate: Date): string | null {
  return endDate > startDate ? null : "End date must be after the start date.";
}

export function validateCreateBudgetPlan(
  value: unknown,
): { data: BudgetPlanInput } | { error: string } {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const title = parseTitle(input.title);
  if (!title) {
    return { error: `Title is required and must be ${TITLE_MAX_LENGTH} characters or fewer.` };
  }

  const description = parseDescription(input.description);
  if (description === undefined) {
    return { error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }

  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);
  if (!startDate || !endDate) {
    return { error: "Start date and end date must be valid ISO date strings." };
  }

  const dateRangeError = validateDateRange(startDate, endDate);
  if (dateRangeError) {
    return { error: dateRangeError };
  }

  return { data: { title, description, startDate, endDate } };
}

export function validateUpdateBudgetPlan(
  value: unknown,
  existing: BudgetPlanInput,
): { data: BudgetPlanInput } | { error: string } {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const title = input.title === undefined ? existing.title : parseTitle(input.title);
  if (!title) {
    return { error: `Title is required and must be ${TITLE_MAX_LENGTH} characters or fewer.` };
  }

  const parsedDescription = parseDescription(input.description);
  if (parsedDescription === undefined && input.description !== undefined) {
    return { error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }

  const startDate = input.startDate === undefined ? existing.startDate : parseDate(input.startDate);
  const endDate = input.endDate === undefined ? existing.endDate : parseDate(input.endDate);
  if (!startDate || !endDate) {
    return { error: "Start date and end date must be valid ISO date strings." };
  }

  const dateRangeError = validateDateRange(startDate, endDate);
  if (dateRangeError) {
    return { error: dateRangeError };
  }

  return {
    data: {
      title,
      description: parsedDescription === undefined ? existing.description : parsedDescription,
      startDate,
      endDate,
    },
  };
}
