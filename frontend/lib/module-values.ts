import type { ModuleItem, SubtaskValue } from "./types";

/** Normalizes an unknown value into a subtask list. */
export function coerceSubtasks(value: unknown): SubtaskValue[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const text = typeof record.text === "string" ? record.text : "";
      const id = typeof record.id === "string" ? record.id : "";
      const done = typeof record.done === "boolean" ? record.done : false;
      return { id, text, done };
    })
    .filter((entry): entry is SubtaskValue => entry !== null);
}

/** Reads a stored string value for a field, defaulting to "". */
export function stringValue(
  values: Record<string, unknown> | null | undefined,
  fieldId: string,
): string {
  const value = values?.[fieldId];
  return typeof value === "string" ? value : "";
}

/** Reads a stored subtask list for a field, defaulting to []. */
export function subtaskValue(
  values: Record<string, unknown> | null | undefined,
  fieldId: string,
): SubtaskValue[] {
  return coerceSubtasks(values?.[fieldId]);
}

/** Returns true when an item has nothing stored for a field. */
export function isEmptyValue(
  item: ModuleItem,
  fieldId: string,
  type: string,
): boolean {
  if (type === "subtask") {
    return subtaskValue(item.values, fieldId).length === 0;
  }
  return stringValue(item.values, fieldId) === "";
}

/** Creates a subtask with a fresh client-side id. */
export function newSubtask(text = "", done = false): SubtaskValue {
  return { id: crypto.randomUUID(), text, done };
}
