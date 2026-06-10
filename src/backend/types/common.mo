module {
  /// Nanoseconds since epoch (Time.now() units)
  public type Timestamp = Int;

  /// Granularity for burn rate aggregation
  public type Granularity = {
    #hourly;
    #daily;
    #weekly;
  };
};
