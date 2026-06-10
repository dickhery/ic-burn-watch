export type TimeRange = "1h" | "24h" | "7d" | "custom";
export type MetricFocus = "usd" | "cycles";

export interface BurnRatePoint {
  timestamp: number; // Unix ms
  cyclesPerSecond: number;
  cyclesPerHour: number;
  cyclesPerDay: number;
  cyclesPerWeek: number;
  usdPerHour?: number;
  usdPerDay?: number;
  usdPerWeek?: number;
}

export interface CurrentBurnRates extends BurnRatePoint {
  snapshotAt: number;
  usdPerXdr?: number;
  icpUsd?: number;
  xdrPerIcp?: number;
  source: "metrics-api" | "fallback";
}

export interface BurnRateHistory {
  points: BurnRatePoint[];
  rangeStart: number;
  rangeEnd: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
