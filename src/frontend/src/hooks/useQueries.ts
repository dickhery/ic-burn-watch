import {
  buildFallbackCurrent,
  buildFallbackPoint,
  fetchCurrentNetworkBurnRates,
  fetchNetworkBurnRateHistory,
} from "@/lib/icMetrics";
import type {
  BurnRateHistory,
  BurnRatePoint,
  CurrentBurnRates,
  DateRange,
  TimeRange,
} from "@/types/burnRate";
import { useQuery } from "@tanstack/react-query";

// ───── helpers ────────────────────────────────────────────────────────────────

/** Derive time bounds from a preset quick-filter range. */
export function rangeToMs(range: TimeRange): { from: number; to: number } {
  const to = Date.now();
  const map: Record<TimeRange, number> = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    custom: 0, // caller supplies its own from/to
  };
  return { from: to - map[range], to };
}

/**
 * Local fallback data keeps the dashboard usable if the public metrics
 * endpoint is temporarily unavailable.
 */
function generateBurnPoints(
  fromMs: number,
  toMs: number,
  intervalMs: number,
): BurnRatePoint[] {
  const points: BurnRatePoint[] = [];
  let t = fromMs;
  while (t <= toMs) {
    points.push(buildFallbackPoint(t));
    t += intervalMs;
  }
  return points;
}

// ───── hooks ──────────────────────────────────────────────────────────────────

export function useCurrentBurnRates() {
  return useQuery<CurrentBurnRates>({
    queryKey: ["burnRates", "current"],
    queryFn: async () => {
      try {
        return await fetchCurrentNetworkBurnRates();
      } catch {
        return buildFallbackCurrent();
      }
    },
    enabled: true,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

export function useBurnRateHistory(range: TimeRange, customRange?: DateRange) {
  const customFromMs = customRange?.from.getTime();
  const customToMs = customRange?.to.getTime();

  return useQuery<BurnRateHistory>({
    queryKey: ["burnRates", "history", range, customFromMs, customToMs],
    queryFn: async () => {
      const { from: fromMs, to: toMs } =
        range === "custom" &&
        customFromMs !== undefined &&
        customToMs !== undefined
          ? { from: customFromMs, to: customToMs }
          : rangeToMs(range);
      const windowMs = toMs - fromMs;
      const intervalMs =
        windowMs <= 3_600_000
          ? 5 * 60_000
          : windowMs <= 86_400_000
            ? 30 * 60_000
            : 3 * 3_600_000;

      try {
        return await fetchNetworkBurnRateHistory(fromMs, toMs, intervalMs);
      } catch {
        return {
          points: generateBurnPoints(fromMs, toMs, intervalMs),
          rangeStart: fromMs,
          rangeEnd: toMs,
        };
      }
    },
    enabled: true,
    staleTime: 25_000,
  });
}
