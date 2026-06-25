type ValidationResult<T> = { data: T } | { error: string };

type Source = Record<string, unknown>;

export interface IncomeSourceInput {
  name: string;
  amount: string;
  expectedDate: Date | null;
  notes: string | null;
}

export interface ExpenseInput {
  name: string;
  amount: string;
  category: string;
  type: "FIXED" | "FLEXIBLE";
  dueDate: Date | null;
  notes: string | null;
}

export interface SavingsGoalInput {
  name: string;
  targetAmount: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | null;
  notes: string | null;
}

const NAME_MAX_LENGTH = 120;
const CATEGORY_MAX_LENGTH = 80;
const NOTES_MAX_LENGTH = 1_000;
const MAX_MONEY_AMOUNT = 1_000_000_000;

const EXPENSE_TYPES = ["FIXED", "FLEXIBLE"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

function asObject(value: unknown): Source | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Source;
}

function parseRequiredText(
  value: unknown,
  fieldName: string,
  maxLength: number,
): { value: string } | { error: string } {
  if (typeof value !== "string") {
    return { error: `${fieldName} is required.` };
  }

  const text = value.trim();
  if (!text || text.length > maxLength) {
    return { error: `${fieldName} is required and must be ${maxLength} characters or fewer.` };
  }

  return { value: text };
}

function parseOptionalText(
  value: unknown,
  fieldName: string,
  maxLength: number,
): { value: string | null | undefined } | { error: string } {
  if (value === undefined) {
    return { value: undefined };
  }

  if (value === null) {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${fieldName} must be text.` };
  }

  const text = value.trim();
  if (text.length > maxLength) {
    return { error: `${fieldName} must be ${maxLength} characters or fewer.` };
  }

  return { value: text || null };
}

function parseMoney(value: unknown, fieldName: string): { value: string } | { error: string } {
  if (value === undefined || value === null || value === "") {
    return { error: `${fieldName} is required and must be greater than 0.` };
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return { error: `${fieldName} must be a number.` };
  }

  const rawAmount = typeof value === "number" ? value.toString() : value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(rawAmount)) {
    return { error: `${fieldName} must be a positive amount with up to two decimal places.` };
  }

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_MONEY_AMOUNT) {
    return {
      error: `${fieldName} must be greater than 0 and no more than ${MAX_MONEY_AMOUNT}.`,
    };
  }

  return { value: rawAmount };
}

function parseOptionalDate(
  value: unknown,
  fieldName: string,
): { value: Date | null | undefined } | { error: string } {
  if (value === undefined) {
    return { value: undefined };
  }

  if (value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${fieldName} must be a valid ISO date string.` };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: `${fieldName} must be a valid ISO date string.` };
  }

  return { value: date };
}

function parseRequiredEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
): { value: T } | { error: string } {
  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    return { error: `${fieldName} must be one of: ${allowedValues.join(", ")}.` };
  }

  return { value: value as T };
}

function parseOptionalEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
): { value: T | null | undefined } | { error: string } {
  if (value === undefined) {
    return { value: undefined };
  }

  if (value === null || value === "") {
    return { value: null };
  }

  return parseRequiredEnum(value, fieldName, allowedValues);
}

export function validateCreateIncomeSource(value: unknown): ValidationResult<IncomeSourceInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name = parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const amount = parseMoney(input.amount, "Amount");
  if ("error" in amount) return amount;

  const expectedDate = parseOptionalDate(input.expectedDate, "Expected date");
  if ("error" in expectedDate) return expectedDate;

  const notes = parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      expectedDate: expectedDate.value ?? null,
      notes: notes.value ?? null,
    },
  };
}

export function validateUpdateIncomeSource(
  value: unknown,
  existing: IncomeSourceInput,
): ValidationResult<IncomeSourceInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name =
    input.name === undefined
      ? { value: existing.name }
      : parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const amount = input.amount === undefined ? { value: existing.amount } : parseMoney(input.amount, "Amount");
  if ("error" in amount) return amount;

  const expectedDate =
    input.expectedDate === undefined
      ? { value: existing.expectedDate }
      : parseOptionalDate(input.expectedDate, "Expected date");
  if ("error" in expectedDate) return expectedDate;

  const notes =
    input.notes === undefined
      ? { value: existing.notes }
      : parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      expectedDate: expectedDate.value ?? null,
      notes: notes.value ?? null,
    },
  };
}

export function validateCreateExpense(value: unknown): ValidationResult<ExpenseInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name = parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const amount = parseMoney(input.amount, "Amount");
  if ("error" in amount) return amount;

  const category = parseRequiredText(input.category, "Category", CATEGORY_MAX_LENGTH);
  if ("error" in category) return category;

  const type = parseRequiredEnum(input.type, "Expense type", EXPENSE_TYPES);
  if ("error" in type) return type;

  const dueDate = parseOptionalDate(input.dueDate, "Due date");
  if ("error" in dueDate) return dueDate;

  const notes = parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      category: category.value,
      type: type.value,
      dueDate: dueDate.value ?? null,
      notes: notes.value ?? null,
    },
  };
}

export function validateUpdateExpense(
  value: unknown,
  existing: ExpenseInput,
): ValidationResult<ExpenseInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name =
    input.name === undefined
      ? { value: existing.name }
      : parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const amount = input.amount === undefined ? { value: existing.amount } : parseMoney(input.amount, "Amount");
  if ("error" in amount) return amount;

  const category =
    input.category === undefined
      ? { value: existing.category }
      : parseRequiredText(input.category, "Category", CATEGORY_MAX_LENGTH);
  if ("error" in category) return category;

  const type =
    input.type === undefined
      ? { value: existing.type }
      : parseRequiredEnum(input.type, "Expense type", EXPENSE_TYPES);
  if ("error" in type) return type;

  const dueDate =
    input.dueDate === undefined
      ? { value: existing.dueDate }
      : parseOptionalDate(input.dueDate, "Due date");
  if ("error" in dueDate) return dueDate;

  const notes =
    input.notes === undefined
      ? { value: existing.notes }
      : parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      category: category.value,
      type: type.value,
      dueDate: dueDate.value ?? null,
      notes: notes.value ?? null,
    },
  };
}

export function validateCreateSavingsGoal(value: unknown): ValidationResult<SavingsGoalInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name = parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const targetAmount = parseMoney(input.targetAmount, "Target amount");
  if ("error" in targetAmount) return targetAmount;

  const priority = parseOptionalEnum(input.priority, "Priority", PRIORITIES);
  if ("error" in priority) return priority;

  const notes = parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      targetAmount: targetAmount.value,
      priority: priority.value ?? null,
      notes: notes.value ?? null,
    },
  };
}

export function validateUpdateSavingsGoal(
  value: unknown,
  existing: SavingsGoalInput,
): ValidationResult<SavingsGoalInput> {
  const input = asObject(value);
  if (!input) {
    return { error: "Request body must be a JSON object." };
  }

  const name =
    input.name === undefined
      ? { value: existing.name }
      : parseRequiredText(input.name, "Name", NAME_MAX_LENGTH);
  if ("error" in name) return name;

  const targetAmount =
    input.targetAmount === undefined
      ? { value: existing.targetAmount }
      : parseMoney(input.targetAmount, "Target amount");
  if ("error" in targetAmount) return targetAmount;

  const priority =
    input.priority === undefined
      ? { value: existing.priority }
      : parseOptionalEnum(input.priority, "Priority", PRIORITIES);
  if ("error" in priority) return priority;

  const notes =
    input.notes === undefined
      ? { value: existing.notes }
      : parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      targetAmount: targetAmount.value,
      priority: priority.value ?? null,
      notes: notes.value ?? null,
    },
  };
}
