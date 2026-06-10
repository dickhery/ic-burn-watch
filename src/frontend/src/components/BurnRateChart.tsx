import { formatCycles, formatTimestamp, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BurnRatePoint, TimeRange } from "@/types/burnRate";
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
  range: TimeRange;
  loading?: boolean;
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: { value: number; payload?: { usdValue?: number } }[];
  label?: string;
  metric: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const usdValue = payload[0]?.payload?.usdValue;
  return (
    <div className="bg-popover border border-border/80 rounded-lg px-3 py-2 shadow-md text-xs font-mono">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-accent font-bold">{formatCycles(val)}</p>
      {usdValue !== undefined && (
        <p className="text-foreground">{formatUsd(usdValue, true)} estimated</p>
      )}
      <p className="text-muted-foreground capitalize">
        {metric.replace("cyclesPer", "per ")}
      </p>
    </div>
  );
}

export function BurnRateChart({
  data,
  metric,
  range,
  loading = false,
  className,
}: BurnRateChartProps) {
  const usdMetric =
    metric === "cyclesPerHour"
      ? "usdPerHour"
      : metric === "cyclesPerDay"
        ? "usdPerDay"
        : "usdPerWeek";
  const formatted = data.map((p) => ({
    ...p,
    label: formatTimestamp(p.timestamp, range),
    value: p[metric],
    usdValue: p[usdMetric],
  }));

  if (loading) {
    return (
      <div
        className={cn("h-48 rounded-lg bg-muted/30 animate-pulse", className)}
      />
    );
  }

  if (!data.length) {
    return (
      <div
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
    <div className={cn("h-48 chart-fade", className)}>
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
            tickFormatter={(v: number) => formatCycles(v, true)}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip metric={metric} />}
            cursor={{ stroke: "oklch(0.75 0.15 190 / 0.3)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
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
