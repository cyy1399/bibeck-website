export const HIGH_VOLUME_LEAD_THRESHOLD_USDT = 50_000_000;

export function isHighVolumeLead(volume: number): boolean {
  return Number.isFinite(volume) && volume >= HIGH_VOLUME_LEAD_THRESHOLD_USDT;
}
