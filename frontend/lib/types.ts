export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type TodoPriority = "urgent" | "normal" | "low";

export type Todo = {
  id: string;
  title: string;
  priority: TodoPriority;
  isDone: boolean;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyLink = {
  id: string;
  planId: string;
  label: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type StudyPlan = {
  id: string;
  title: string;
  isDone: boolean;
  doneAt: string | null;
  links: StudyLink[] | null;
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

export type JobStatus = "Planning" | "Applied" | "In Process" | "Rejected";

export type Job = {
  id: string;
  position: string;
  company: string;
  deadline: string | null;
  url: string;
  status: JobStatus;
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
