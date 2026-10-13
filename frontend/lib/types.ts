export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  notes: string;
  eventDate: string;
  eventTime: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  note: string;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
};

export type TransactionKind = "income" | "expense";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  amountCents: number;
  category: string;
  occurredOn: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionSummary = {
  month: string;
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

export type WishlistItem = {
  id: string;
  name: string;
  plannedAmountCents: number;
  isBought: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiEnvelope<T> = {
  message?: string;
  data: T;
  error?: string;
};

export type FieldType = "text" | "dropdown" | "subtask" | "date" | "link";

export type ModuleField = {
  id: string;
  moduleId: string;
  label: string;
  type: FieldType;
  options: string[] | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Module = {
  id: string;
  userId: string;
  title: string;
  description: string;
  fields: ModuleField[] | null;
  createdAt: string;
  updatedAt: string;
};

export type SubtaskValue = {
  id: string;
  text: string;
  done: boolean;
};

export type ModuleItem = {
  id: string;
  moduleId: string;
  userId: string;
  title: string;
  isDone: boolean;
  doneAt: string | null;
  values: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type ModuleFieldDraft = {
  id?: string;
  localKey: string;
  label: string;
  type: FieldType;
  options: string[];
};
