type ValidationResult<T> = { data: T } | { error: string };

type Source = Record<string, unknown>;
type ScheduleFrequency = "ONCE" | "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "CUSTOM";

export interface IncomeSourceInput {
  name: string;
  amount: string;
  expectedDate: Date | null;
  frequency: ScheduleFrequency;
  customDates: Date[];
  notes: string | null;
}

export interface ExpenseInput {
  name: string;
  amount: string;
  category: string;
  type: "FIXED" | "FLEXIBLE";
  dueDate: Date | null;
  frequency: ScheduleFrequency;
  customDates: Date[];
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
const SCHEDULE_FREQUENCIES = ["ONCE", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "CUSTOM"] as const;

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

function parseOptionalDateArray(
  value: unknown,
  fieldName: string,
): { value: Date[] | undefined } | { error: string } {
  if (value === undefined) {
    return { value: undefined };
  }

  if (!Array.isArray(value)) {
    return { error: `${fieldName} must be a list of valid ISO date strings.` };
  }

  const dates = value.map((entry) => {
    if (typeof entry !== "string" || entry.trim() === "") {
      return null;
    }

    const date = new Date(entry);
    return Number.isNaN(date.getTime()) ? null : date;
  });

  if (dates.some((date) => date === null)) {
    return { error: `${fieldName} must contain only valid ISO date strings.` };
  }

  return {
    value: (dates as Date[]).sort((left, right) => left.getTime() - right.getTime()),
  };
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

function parseSchedule(
  input: Source,
  existing?: { frequency: ScheduleFrequency; customDates: Date[] },
): { value: { frequency: ScheduleFrequency; customDates: Date[] } } | { error: string } {
  const parsedFrequency =
    input.frequency === undefined
      ? { value: existing?.frequency ?? "ONCE" }
      : parseRequiredEnum(input.frequency, "Frequency", SCHEDULE_FREQUENCIES);
  if ("error" in parsedFrequency) {
    return parsedFrequency;
  }

  const parsedCustomDates =
    input.customDates === undefined
      ? { value: existing?.customDates }
      : parseOptionalDateArray(input.customDates, "Custom dates");
  if ("error" in parsedCustomDates) {
    return parsedCustomDates;
  }

  const customDates = parsedCustomDates.value ?? [];
  if (parsedFrequency.value === "CUSTOM" && customDates.length === 0) {
    return { error: "Custom frequency requires at least one custom date." };
  }

  return {
    value: {
      frequency: parsedFrequency.value,
      customDates: parsedFrequency.value === "CUSTOM" ? customDates : [],
    },
  };
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

  const schedule = parseSchedule(input);
  if ("error" in schedule) return schedule;

  const notes = parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      expectedDate: expectedDate.value ?? null,
      frequency: schedule.value.frequency,
      customDates: schedule.value.customDates,
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

  const schedule = parseSchedule(input, existing);
  if ("error" in schedule) return schedule;

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
      frequency: schedule.value.frequency,
      customDates: schedule.value.customDates,
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

  const schedule = parseSchedule(input);
  if ("error" in schedule) return schedule;

  const notes = parseOptionalText(input.notes, "Notes", NOTES_MAX_LENGTH);
  if ("error" in notes) return notes;

  return {
    data: {
      name: name.value,
      amount: amount.value,
      category: category.value,
      type: type.value,
      dueDate: dueDate.value ?? null,
      frequency: schedule.value.frequency,
      customDates: schedule.value.customDates,
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

  const schedule = parseSchedule(input, existing);
  if ("error" in schedule) return schedule;

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
      frequency: schedule.value.frequency,
      customDates: schedule.value.customDates,
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
