/** Codes and paths only: never echo submitted financial values. */
export interface CodecError {
  category: "VALIDATION_ERROR";
  safeCode: string;
  fieldRefs: string[];
  retryable: false;
}
export type CodecResult<T> = { ok: true; value: T } | { ok: false; error: CodecError };
export const accepted = <T>(value: T): CodecResult<T> => ({ ok: true, value });
export const rejected = (safeCode: string, fieldRef = "input"): CodecResult<never> => ({
  ok: false, error: { category: "VALIDATION_ERROR", safeCode, fieldRefs: [fieldRef], retryable: false },
});
export function plainRecord(input: unknown): input is Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.getPrototypeOf(input) !== Object.prototype) return false;
  return Reflect.ownKeys(input).every(key => typeof key === "string" && Object.getOwnPropertyDescriptor(input, key)?.enumerable
    && Object.hasOwn(Object.getOwnPropertyDescriptor(input, key)!, "value"));
}
export const exactKeys = (input: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean =>
  required.every(key => Object.hasOwn(input, key)) && Object.keys(input).every(key => required.includes(key) || optional.includes(key));
