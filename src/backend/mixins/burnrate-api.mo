import List "mo:core/List";
import BurnRateTypes "../types/burnrate";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import BurnRateLib "../lib/burnrate";

mixin (snapshots : List.List<BurnRateTypes.BurnRateSnapshot>, selfPrincipal : Principal.Principal) {
  /// Fetch the latest burn rate from the IC management canister and return current rates
  public func getCurrentBurnRates() : async BurnRateTypes.BurnRateSnapshot {
    let mgmt : actor {
      canister_status : ({ canister_id : Principal }) -> async {
        idle_cycles_burned_per_day : Nat;
      };
    } = actor ("aaaaa-aa");
    let status = await mgmt.canister_status({ canister_id = selfPrincipal });
    let snapshot = BurnRateLib.buildSnapshot(Time.now(), status.idle_cycles_burned_per_day);
    snapshots.add(snapshot);
    snapshot;
  };

  /// Return all stored snapshots as a summary (current + history)
  public query func getBurnRateHistory() : async BurnRateTypes.BurnRateSummary {
    let all = snapshots.toArray();
    let size = all.size();
    if (size == 0) {
      let empty : BurnRateTypes.BurnRateSnapshot = {
        timestamp = 0;
        cyclesPerDay = 0;
        cyclesPerHour = 0;
        cyclesPerWeek = 0;
      };
      return { current = empty; history = [] };
    };
    let current = all[size - 1];
    { current; history = all };
  };

  /// Return snapshots filtered by time range and granularity
  public query func getBurnRateForRange(
    filter : BurnRateTypes.TimeRangeFilter
  ) : async BurnRateTypes.BurnRateRangeResult {
    let filtered = BurnRateLib.filterByRange(snapshots, filter.startTime, filter.endTime);
    let downsampled = BurnRateLib.applyGranularity(filtered, filter.granularity);
    { snapshots = downsampled; granularity = filter.granularity };
  };
};
