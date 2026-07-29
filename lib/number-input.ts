export function sanitizeNumberInput(value: string): string {
  const compact = value.replace(/[\s,]/g, "").replace(/[^\d.]/g, "");
  const dotIndex = compact.indexOf(".");
  if (dotIndex === -1) return compact;
  return compact.slice(0, dotIndex + 1) + compact.slice(dotIndex + 1).replace(/\./g, "");
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
