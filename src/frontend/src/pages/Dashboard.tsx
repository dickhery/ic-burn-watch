import { BurnRateChart } from "@/components/BurnRateChart";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBurnRateHistory, useCurrentBurnRates } from "@/hooks/useQueries";
import { formatCycles, formatCyclesLabel, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DateRange, TimeRange } from "@/types/burnRate";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart2,
  Calendar,
  CalendarDays,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

type ViewMode = "hourly" | "daily" | "weekly";

const VIEW_MODES: {
  value: ViewMode;
  label: string;
  icon: React.ReactNode;
  metric: "cyclesPerHour" | "cyclesPerDay" | "cyclesPerWeek";
}[] = [
  {
    value: "hourly",
    label: "Hourly",
    icon: <Clock className="w-3.5 h-3.5" />,
    metric: "cyclesPerHour",
  },
  {
    value: "daily",
    label: "Daily",
    icon: <CalendarDays className="w-3.5 h-3.5" />,
    metric: "cyclesPerDay",
  },
  {
    value: "weekly",
    label: "Weekly",
    icon: <Calendar className="w-3.5 h-3.5" />,
    metric: "cyclesPerWeek",
  },
];

const QUICK_FILTERS: { label: string; range: TimeRange }[] = [
  { label: "Last Hour", range: "1h" },
  { label: "Last 24h", range: "24h" },
  { label: "Last 7 Days", range: "7d" },
];

function calcTrend(
  current: number,
  prev: number,
): { trend: "up" | "down" | "flat"; pct: number } {
  if (prev === 0) return { trend: "flat", pct: 0 };
  const pct = ((current - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return { trend: "flat", pct };
  return { trend: pct > 0 ? "up" : "down", pct };
}

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const { data: current, isLoading: currentLoading } = useCurrentBurnRates();
  const { data: history, isLoading: historyLoading } = useBurnRateHistory(
    timeRange,
    customRange,
  );

  const activeMetric =
    VIEW_MODES.find((v) => v.value === viewMode)?.metric ?? "cyclesPerDay";
  const _activePeriod: "hour" | "day" | "week" =
    viewMode === "hourly" ? "hour" : viewMode === "daily" ? "day" : "week";

  const pts = history?.points ?? [];
  const prevValue = pts.length > 1 ? pts[pts.length - 2][activeMetric] : 0;
  const currValue = current
    ? viewMode === "hourly"
      ? current.cyclesPerHour
      : viewMode === "daily"
        ? current.cyclesPerDay
        : current.cyclesPerWeek
    : 0;
  const { trend, pct } = calcTrend(currValue, prevValue);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await qc.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [qc]);

  function applyCustomRange() {
    const from = fromRef.current?.value;
    const to = toRef.current?.value;
    if (from && to) {
      setCustomRange({ from: new Date(from), to: new Date(to) });
      setTimeRange("custom");
    }
  }

  const snapshotLabel = current?.snapshotAt
    ? `Snapshot ${new Date(current.snapshotAt).toLocaleTimeString()}`
    : "";
  const sourceLabel = current
    ? current.source === "metrics-api"
      ? "IC Metrics API"
      : "Local estimate"
    : "Loading";

  return (
    <div data-ocid="dashboard.page">
      {/* Hero band */}
      <section
        className="relative overflow-hidden border-b border-border/50"
        style={{
          background:
            'linear-gradient(rgba(14,16,20,0.78) 0%, rgba(14,16,20,0.95) 100%), url("/assets/generated/ic-network-hero.dim_1600x480.jpg") center/cover no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-accent" />
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
              Cycle Burn Rate Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Real-time cycle consumption metrics for the Internet Computer
            network, sourced from the public IC Metrics API.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
            <TabsList
              className="bg-card border border-border/70"
              data-ocid="dashboard.view_mode.tab"
            >
              {VIEW_MODES.map((m) => (
                <TabsTrigger
                  key={m.value}
                  value={m.value}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:shadow-none"
                  data-ocid={`dashboard.view_mode.${m.value}`}
                >
                  {m.icon}
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 border-border/70 text-muted-foreground hover:text-foreground hover:border-accent/40 text-xs"
            data-ocid="dashboard.refresh_button"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono mr-1">
            Range:
          </span>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.range}
              type="button"
              onClick={() => {
                setTimeRange(f.range);
                setCustomRange(undefined);
              }}
              data-ocid={`dashboard.filter.${f.range}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-smooth border",
                timeRange === f.range
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-card border-border/60 text-muted-foreground hover:border-accent/30 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}

          {/* Custom date range */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <input
              ref={fromRef}
              type="date"
              defaultValue={new Date(Date.now() - 7 * 86400000)
                .toISOString()
                .slice(0, 10)}
              className="text-xs font-mono bg-card border border-border/70 rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
              data-ocid="dashboard.date_from.input"
              aria-label="Start date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              ref={toRef}
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="text-xs font-mono bg-card border border-border/70 rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
              data-ocid="dashboard.date_to.input"
              aria-label="End date"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={applyCustomRange}
              className="text-xs border-border/70 hover:border-accent/40 hover:text-accent"
              data-ocid="dashboard.apply_range_button"
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(() => {
            if (!current && currentLoading) {
              return ["hourly", "daily", "weekly"].map((k) => (
                <MetricCard
                  key={k}
                  label={k}
                  value=""
                  unit=""
                  loading
                  data-ocid={`dashboard.metric.${k}`}
                />
              ));
            }
            const cards: {
              key: ViewMode;
              cycles: number;
              usd?: number;
              period: "hour" | "day" | "week";
            }[] = [
              {
                key: "hourly",
                cycles: current?.cyclesPerHour ?? 0,
                usd: current?.usdPerHour,
                period: "hour",
              },
              {
                key: "daily",
                cycles: current?.cyclesPerDay ?? 0,
                usd: current?.usdPerDay,
                period: "day",
              },
              {
                key: "weekly",
                cycles: current?.cyclesPerWeek ?? 0,
                usd: current?.usdPerWeek,
                period: "week",
              },
            ];
            return cards.map(({ key, cycles, usd, period }) => {
              const { value, unit } = formatCyclesLabel(cycles, period);
              const isActive = viewMode === key;
              const cardTrend = isActive ? trend : undefined;
              const cardPct = isActive ? pct : undefined;
              const sublabel = [
                usd !== undefined ? `${formatUsd(usd, true)} estimated` : null,
                isActive ? snapshotLabel : null,
              ]
                .filter(Boolean)
                .join(" | ");
              return (
                <MetricCard
                  key={key}
                  label={`${key.charAt(0).toUpperCase() + key.slice(1)} Rate`}
                  value={value}
                  unit={unit}
                  trend={cardTrend}
                  trendPct={cardPct}
                  sublabel={sublabel || undefined}
                  highlighted={isActive}
                  data-ocid={`dashboard.metric.${key}`}
                />
              );
            });
          })()}
        </div>

        {/* Chart section */}
        <section
          className="bg-card rounded-xl border subtle-border p-5 space-y-4"
          data-ocid="dashboard.chart.panel"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {VIEW_MODES.find((v) => v.value === viewMode)?.label} Burn Rate
                Trend
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {timeRange === "custom" && customRange
                  ? `${customRange.from.toLocaleDateString()} — ${customRange.to.toLocaleDateString()}`
                  : (QUICK_FILTERS.find((f) => f.range === timeRange)?.label ??
                    "Custom range")}
              </p>
            </div>
            {pts.length > 0 && (
              <Badge
                variant="outline"
                className="text-xs font-mono border-accent/30 text-accent bg-accent/5"
              >
                {pts.length} data points
              </Badge>
            )}
          </div>

          <BurnRateChart
            data={pts}
            metric={activeMetric}
            range={timeRange}
            loading={historyLoading}
            data-ocid="dashboard.chart.canvas_target"
          />

          {historyLoading && (
            <div
              className="flex items-center gap-2 text-xs text-muted-foreground"
              data-ocid="dashboard.chart.loading_state"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Loading chart data…
            </div>
          )}
        </section>

        {/* Network info footer */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Data Source",
              value: sourceLabel,
            },
            {
              label: "Current Rate",
              value: current
                ? `${formatCycles(current.cyclesPerSecond, true)} cycles / sec`
                : "Loading",
            },
            { label: "Update Frequency", value: "Every 30 seconds" },
            {
              label: "USD Estimate",
              value: current?.usdPerXdr
                ? `${formatUsd(current.usdPerXdr)} / XDR`
                : "1T cycles = 1 XDR",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-muted/30 rounded-lg px-4 py-3 border border-border/40"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                {item.label}
              </p>
              <p className="text-xs text-foreground font-medium">
                {item.value}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
