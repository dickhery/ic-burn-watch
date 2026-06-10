import type { TimeRange } from "@/types/burnRate";

type NumericValue = bigint | number | string | null | undefined;

function toFiniteNumber(value: NumericValue): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  if (typeof value === "number") return value;
  return Number.NaN;
}

/**
 * Format a raw cycle count into a human-readable string.
 * @param compact  when true, abbreviate to P/T/B/M suffixes for axis ticks
 */
export function formatCycles(cycles: NumericValue, compact = false): string {
  const value = toFiniteNumber(cycles);
  if (!Number.isFinite(value)) return "N/A";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1e15) return `${sign}${(abs / 1e15).toFixed(1)}P`;
    if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
    return `${value.toFixed(0)}`;
  }
  if (abs >= 1e15) return `${sign}${(abs / 1e15).toFixed(3)}P`;
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  return value.toLocaleString();
}

/** Format a USD estimate for the same burn-rate period. */
export function formatUsd(value: NumericValue, compact = false): string {
  const amount = toFiniteNumber(value);
  if (!Number.isFinite(amount)) return "N/A";
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`;
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
}

/** Format a Unix-ms timestamp to a readable label, scaled to the active range. */
export function formatTimestamp(ms: number, range: TimeRange): string {
  const d = new Date(ms);
  if (range === "1h") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "24h") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
  });
}

/** Return a short human label for a cycle value with full unit name. */
export function formatCyclesLabel(
  cycles: NumericValue,
  period: "hour" | "day" | "week",
): {
  value: string;
  unit: string;
} {
  return { value: formatCycles(cycles), unit: `cycles / ${period}` };
}
