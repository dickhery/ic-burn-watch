import { formatCycles, formatTimestamp, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BurnRatePoint, MetricFocus, TimeRange } from "@/types/burnRate";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BurnRateChartProps {
  data: BurnRatePoint[];
  metric: "cyclesPerHour" | "cyclesPerDay" | "cyclesPerWeek";
  displayFocus?: MetricFocus;
  period: "hour" | "day" | "week";
  range: TimeRange;
  loading?: boolean;
  className?: string;
  "data-ocid"?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  displayFocus,
  period,
}: {
  active?: boolean;
  payload?: {
    value: number;
    payload?: { cyclesValue?: number; usdValue?: number };
  }[];
  label?: string;
  displayFocus: MetricFocus;
  period: "hour" | "day" | "week";
}) {
  if (!active || !payload?.length) return null;
  const cyclesValue = payload[0]?.payload?.cyclesValue ?? 0;
  const usdValue = payload[0]?.payload?.usdValue;
  const primaryValue =
    displayFocus === "usd" && usdValue !== undefined
      ? formatUsd(usdValue, true)
      : formatCycles(cyclesValue);
  const primaryUnit =
    displayFocus === "usd" && usdValue !== undefined
      ? `USD / ${period}`
      : `cycles / ${period}`;
  const secondaryValue =
    displayFocus === "usd" && usdValue !== undefined
      ? formatCycles(cyclesValue)
      : usdValue !== undefined
        ? formatUsd(usdValue, true)
        : undefined;
  const secondaryUnit =
    displayFocus === "usd" && usdValue !== undefined
      ? `cycles / ${period}`
      : usdValue !== undefined
        ? `USD / ${period}`
        : undefined;

  return (
    <div className="bg-popover border border-border/80 rounded-lg px-3 py-2 shadow-md text-xs font-mono">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-accent font-bold">
        {primaryValue}{" "}
        <span className="font-normal text-muted-foreground">{primaryUnit}</span>
      </p>
      {secondaryValue && (
        <p className="text-foreground">
          {secondaryValue}{" "}
          <span className="text-muted-foreground">{secondaryUnit}</span>
        </p>
      )}
    </div>
  );
}

export function BurnRateChart({
  data,
  metric,
  displayFocus = "usd",
  period,
  range,
  loading = false,
  className,
  "data-ocid": ocid,
}: BurnRateChartProps) {
  const usdMetric =
    metric === "cyclesPerHour"
      ? "usdPerHour"
      : metric === "cyclesPerDay"
        ? "usdPerDay"
        : "usdPerWeek";
  const hasUsdData = data.some((p) => p[usdMetric] !== undefined);
  const chartFocus: MetricFocus =
    displayFocus === "usd" && hasUsdData ? "usd" : "cycles";
  const formatted = data.map((p) => ({
    ...p,
    label: formatTimestamp(p.timestamp, range),
    chartValue: chartFocus === "usd" ? (p[usdMetric] ?? 0) : p[metric],
    cyclesValue: p[metric],
    usdValue: p[usdMetric],
  }));

  if (loading) {
    return (
      <div
        data-ocid={ocid}
        className={cn("h-48 rounded-lg bg-muted/30 animate-pulse", className)}
      />
    );
  }

  if (!data.length) {
    return (
      <div
        data-ocid={ocid}
        className={cn(
          "h-48 flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm",
          className,
        )}
      >
        No data available for this range
      </div>
    );
  }

  return (
    <div data-ocid={ocid} className={cn("h-48 chart-fade", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formatted}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="oklch(0.75 0.15 190)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="oklch(0.75 0.15 190)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.28 0.02 260)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fontSize: 10,
              fill: "oklch(0.55 0.01 260)",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{
              fontSize: 10,
              fill: "oklch(0.55 0.01 260)",
              fontFamily: "var(--font-mono)",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              chartFocus === "usd" ? formatUsd(v, true) : formatCycles(v, true)
            }
            width={70}
          />
          <Tooltip
            content={
              <CustomTooltip displayFocus={chartFocus} period={period} />
            }
            cursor={{ stroke: "oklch(0.75 0.15 190 / 0.3)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="chartValue"
            stroke="oklch(0.75 0.15 190)"
            strokeWidth={2}
            fill="url(#burnGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "oklch(0.75 0.15 190)",
              stroke: "oklch(0.145 0.014 260)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
