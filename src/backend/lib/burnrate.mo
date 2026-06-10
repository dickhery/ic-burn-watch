import List "mo:core/List";
import Array "mo:core/Array";
import Common "../types/common";
import BurnRateTypes "../types/burnrate";

module {
  /// Convert daily burn rate to hourly and weekly derived rates
  public func deriveRates(cyclesPerDay : Nat) : { cyclesPerHour : Nat; cyclesPerWeek : Nat } {
    let cyclesPerHour = cyclesPerDay / 24;
    let cyclesPerWeek = cyclesPerDay * 7;
    { cyclesPerHour; cyclesPerWeek };
  };

  /// Build a snapshot from a daily rate and timestamp
  public func buildSnapshot(
    timestamp : Common.Timestamp,
    cyclesPerDay : Nat,
  ) : BurnRateTypes.BurnRateSnapshot {
    let rates = deriveRates(cyclesPerDay);
    {
      timestamp;
      cyclesPerDay;
      cyclesPerHour = rates.cyclesPerHour;
      cyclesPerWeek = rates.cyclesPerWeek;
    };
  };

  /// Filter a list of snapshots to those within [startTime, endTime]
  public func filterByRange(
    snapshots : List.List<BurnRateTypes.BurnRateSnapshot>,
    startTime : ?Common.Timestamp,
    endTime : ?Common.Timestamp,
  ) : [BurnRateTypes.BurnRateSnapshot] {
    let arr = snapshots.toArray();
    arr.filter(func(s : BurnRateTypes.BurnRateSnapshot) : Bool {
      let afterStart = switch (startTime) {
        case null true;
        case (?t) s.timestamp >= t;
      };
      let beforeEnd = switch (endTime) {
        case null true;
        case (?t) s.timestamp <= t;
      };
      afterStart and beforeEnd;
    });
  };

  /// Downsample snapshots to the requested granularity
  public func applyGranularity(
    snapshots : [BurnRateTypes.BurnRateSnapshot],
    granularity : Common.Granularity,
  ) : [BurnRateTypes.BurnRateSnapshot] {
    // Group snapshots by bucket, keeping the last entry per time bucket.
    let bucketNs : Int = switch (granularity) {
      case (#hourly) 3_600_000_000_000;
      case (#daily) 86_400_000_000_000;
      case (#weekly) 604_800_000_000_000;
    };
    if (snapshots.size() == 0) return [];
    var result = List.empty<BurnRateTypes.BurnRateSnapshot>();
    var currentBucket : Int = snapshots[0].timestamp / bucketNs;
    var bucketSnapshot = snapshots[0];
    for (s in snapshots.values()) {
      let bucket = s.timestamp / bucketNs;
      if (bucket != currentBucket) {
        result.add(bucketSnapshot);
        currentBucket := bucket;
      };
      bucketSnapshot := s;
    };
    result.add(bucketSnapshot);
    result.toArray();
  };
};
