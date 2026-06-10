import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  trend?: "up" | "down" | "flat";
  trendPct?: number;
  sublabel?: string;
  highlighted?: boolean;
  loading?: boolean;
  "data-ocid"?: string;
}

function TrendIcon({ trend }: { trend?: "up" | "down" | "flat" }) {
  if (trend === "up")
    return <TrendingUp className="w-4 h-4 text-destructive" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-accent" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  trendPct,
  sublabel,
  highlighted = false,
  loading = false,
  "data-ocid": ocid,
}: MetricCardProps) {
  return (
    <div
      data-ocid={ocid}
      className={cn(
        "relative rounded-xl p-5 border subtle-border flex flex-col gap-3 transition-smooth hover:border-accent/40 group",
        highlighted ? "bg-accent/8 border-accent/35 glow-accent-sm" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {trend && (
          <div className="flex items-center gap-1">
            <TrendIcon trend={trend} />
            {trendPct !== undefined && (
              <span
                className={cn(
                  "text-xs font-mono",
                  trend === "up"
                    ? "text-destructive"
                    : trend === "down"
                      ? "text-accent"
                      : "text-muted-foreground",
                )}
              >
                {trendPct > 0 ? "+" : ""}
                {trendPct.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-3/4 rounded bg-muted/60 animate-pulse" />
          <div className="h-3.5 w-1/2 rounded bg-muted/40 animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-2">
            <span
              className={cn(
                "font-display font-bold leading-none tracking-tight",
                highlighted
                  ? "text-3xl text-accent"
                  : "text-2xl text-foreground",
              )}
            >
              {value}
            </span>
            <span className="text-xs font-mono text-muted-foreground pb-0.5">
              {unit}
            </span>
          </div>
          {sublabel && (
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          )}
        </>
      )}
    </div>
  );
}
