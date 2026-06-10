import type { TimeRange } from "@/types/burnRate";

/**
 * Format a raw cycle count into a human-readable string.
 * @param compact  when true, abbreviate to T/B/M suffix for axis ticks
 */
export function formatCycles(cycles: number, compact = false): string {
  if (compact) {
    if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(1)}T`;
    if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(1)}B`;
    if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
    return `${cycles.toFixed(0)}`;
  }
  if (cycles >= 1e12) return `${(cycles / 1e12).toFixed(3)}T`;
  if (cycles >= 1e9) return `${(cycles / 1e9).toFixed(2)}B`;
  if (cycles >= 1e6) return `${(cycles / 1e6).toFixed(1)}M`;
  return cycles.toLocaleString();
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
  cycles: number,
  period: "hour" | "day" | "week",
): {
  value: string;
  unit: string;
} {
  return { value: formatCycles(cycles), unit: `cycles / ${period}` };
}
