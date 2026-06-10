import type { backendInterface, BurnRateSummary, BurnRateSnapshot, BurnRateRangeResult, TimeRangeFilter } from "../backend";
import { Granularity } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000); // nanoseconds

function makeSnapshot(offsetHours: number): BurnRateSnapshot {
  const ts = now - BigInt(offsetHours) * BigInt(3_600_000_000_000);
  // Realistic-ish cycle burn rates for IC network
  const baseHourly = BigInt(1_200_000_000_000); // ~1.2T cycles/hour
  const jitter = BigInt(Math.floor(Math.random() * 200_000_000_000));
  const cyclesPerHour = baseHourly + jitter;
  return {
    timestamp: ts,
    cyclesPerHour,
    cyclesPerDay: cyclesPerHour * BigInt(24),
    cyclesPerWeek: cyclesPerHour * BigInt(168),
  };
}

const currentSnapshot: BurnRateSnapshot = makeSnapshot(0);

// 30 hourly snapshots for history
const historySnapshots: BurnRateSnapshot[] = Array.from({ length: 30 }, (_, i) => makeSnapshot(i + 1));

export const mockBackend: backendInterface = {
  getCurrentBurnRates: async (): Promise<BurnRateSnapshot> => {
    return currentSnapshot;
  },

  getBurnRateHistory: async (): Promise<BurnRateSummary> => {
    return {
      current: currentSnapshot,
      history: historySnapshots,
    };
  },

  getBurnRateForRange: async (filter: TimeRangeFilter): Promise<BurnRateRangeResult> => {
    const count = filter.granularity === Granularity.hourly ? 24
      : filter.granularity === Granularity.daily ? 7
      : 4;
    const offsetMultiplier = filter.granularity === Granularity.hourly ? 1
      : filter.granularity === Granularity.daily ? 24
      : 168;
    const snapshots = Array.from({ length: count }, (_, i) => makeSnapshot(i * offsetMultiplier));
    return {
      granularity: filter.granularity,
      snapshots,
    };
  },
};
