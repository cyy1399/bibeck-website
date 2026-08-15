export function formatVolume(value: number): string {
  const safe = Number.isFinite(value) && value >= 0 ? value : 0;
  if (safe >= 1_000_000_000) return `${trim(safe / 1_000_000_000)}B`;
  if (safe >= 1_000_000) return `${trim(safe / 1_000_000)}M`;
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(safe);
}

function trim(value: number): string {
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

