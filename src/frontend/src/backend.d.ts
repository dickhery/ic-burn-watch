import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BurnRateSummary {
    history: Array<BurnRateSnapshot>;
    current: BurnRateSnapshot;
}
export interface BurnRateSnapshot {
    cyclesPerHour: bigint;
    cyclesPerWeek: bigint;
    cyclesPerDay: bigint;
    timestamp: Timestamp;
}
export type Timestamp = bigint;
export interface TimeRangeFilter {
    startTime?: Timestamp;
    endTime?: Timestamp;
    granularity: Granularity;
}
export interface BurnRateRangeResult {
    granularity: Granularity;
    snapshots: Array<BurnRateSnapshot>;
}
export enum Granularity {
    hourly = "hourly",
    daily = "daily",
    weekly = "weekly"
}
export interface backendInterface {
    getBurnRateForRange(filter: TimeRangeFilter): Promise<BurnRateRangeResult>;
    getBurnRateHistory(): Promise<BurnRateSummary>;
    getCurrentBurnRates(): Promise<BurnRateSnapshot>;
}
