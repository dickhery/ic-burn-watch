import List "mo:core/List";
import Principal "mo:core/Principal";
import BurnRateTypes "types/burnrate";
import BurnRateApiMixin "mixins/burnrate-api";

actor self {
  let snapshots : List.List<BurnRateTypes.BurnRateSnapshot>;
  include BurnRateApiMixin(snapshots, Principal.fromActor(self));
};

