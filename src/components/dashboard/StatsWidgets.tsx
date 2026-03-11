import { Radio, TrendingUp, Target, BarChart3 } from "lucide-react";

interface StatsData {
  liveMatches: number;
  hotMatches: number;
  alertsToday: number;
  predictionAccuracy: number;
}

const StatsWidgets = ({ stats }: { stats: StatsData }) => {
  const widgets = [
    { icon: Radio, label: "Live Matches", value: stats.liveMatches, color: "text-foreground", iconColor: "text-accent" },
    { icon: TrendingUp, label: "Hot Matches", value: stats.hotMatches, color: "text-primary", iconColor: "text-primary" },
    { icon: BarChart3, label: "Predictions", value: stats.alertsToday || '–', color: "text-accent", iconColor: "text-accent" },
    { icon: Target, label: "Leagues", value: stats.predictionAccuracy || '–', color: "text-primary", iconColor: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {widgets.map((w) => (
        <div key={w.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 transition-colors hover:border-border/80 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-secondary shrink-0">
              <w.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${w.iconColor}`} />
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{w.label}</span>
          </div>
          <div className={`mt-2 sm:mt-3 text-xl sm:text-2xl font-bold font-mono ${w.color}`}>{w.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsWidgets;
