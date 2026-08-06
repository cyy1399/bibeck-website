function normalizeDigits(value: string): string {
  return value.replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xff10)).replace(/．/g, ".").replace(/Ｍ/g, "M");
}

export function sanitizeNumberInput(value: string): string {
  const normalized = normalizeDigits(value.trim());
  const multiplier = /m$/i.test(normalized) ? 1_000_000 : 1;
  const compact = normalized.replace(/m$/i, "").replace(/[\s,]/g, "");
  if (compact.startsWith("-") || !/^\d*(?:\.\d*)?$/.test(compact)) return "";
  const dotIndex = compact.indexOf(".");
  const sanitized = dotIndex === -1 ? compact : compact.slice(0, dotIndex + 1) + compact.slice(dotIndex + 1).replace(/\./g, "");
  if (multiplier === 1 || sanitized === "" || sanitized === ".") return sanitized;
  const parsed = Number(sanitized) * multiplier;
  return Number.isFinite(parsed) ? String(parsed) : "";
}

export function formatNumberInput(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";
  const sanitized = sanitizeNumberInput(String(value));
  if (sanitized === "") return "";
  const [rawInteger, decimal] = sanitized.split(".");
  const integer = rawInteger === "" ? "0" : rawInteger.replace(/^0+(?=\d)/, "");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sanitized.includes(".") ? `${grouped}.${decimal ?? ""}` : grouped;
}

export function parseNumberInput(value: string): number {
  const sanitized = sanitizeNumberInput(value);
  if (sanitized === "" || sanitized === ".") return 0;
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function isValidNumberInput(value: string): boolean {
  if (value.trim() === "") return true;
  const sanitized = sanitizeNumberInput(value);
  return sanitized !== "" && sanitized !== "." && Number.isFinite(Number(sanitized));
}
