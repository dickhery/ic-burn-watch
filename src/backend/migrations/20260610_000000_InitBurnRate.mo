import List "mo:core/List";

module {
  type BurnRateSnapshot = {
    timestamp : Int;
    cyclesPerDay : Nat;
    cyclesPerHour : Nat;
    cyclesPerWeek : Nat;
  };

  type OldActor = {};

  type NewActor = {
    snapshots : List.List<BurnRateSnapshot>;
  };

  public func migration(_ : OldActor) : NewActor {
    { snapshots = List.empty<BurnRateSnapshot>() };
  };
};
