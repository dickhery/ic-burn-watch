import Common "common";

module {
  /// A single burn rate snapshot captured at a point in time.
  /// cyclesPerDay comes from canister_status.idle_cycles_burned_per_day
  public type BurnRateSnapshot = {
    timestamp : Common.Timestamp;
    cyclesPerDay : Nat;
    cyclesPerHour : Nat;
    cyclesPerWeek : Nat;
  };

  /// Aggregated summary returned to callers
  public type BurnRateSummary = {
    current : BurnRateSnapshot;
    history : [BurnRateSnapshot];
  };

  /// Filter parameters for querying history
  public type TimeRangeFilter = {
    startTime : ?Common.Timestamp;
    endTime : ?Common.Timestamp;
    granularity : Common.Granularity;
  };

  /// Result for a ranged history query
  public type BurnRateRangeResult = {
    snapshots : [BurnRateSnapshot];
    granularity : Common.Granularity;
  };
};
