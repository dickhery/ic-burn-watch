export type TimeRange = "1h" | "24h" | "7d" | "custom";

export interface BurnRatePoint {
  timestamp: number; // Unix ms
  cyclesPerHour: number;
  cyclesPerDay: number;
  cyclesPerWeek: number;
}

export interface CurrentBurnRates {
  cyclesPerHour: number;
  cyclesPerDay: number;
  cyclesPerWeek: number;
  snapshotAt: number;
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
