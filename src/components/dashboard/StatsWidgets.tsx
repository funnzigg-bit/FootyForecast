import { Radio, TrendingUp, Target, BarChart3 } from "lucide-react";

interface StatsData {
  liveMatches: number;
  hotMatches: number;
  alertsToday: number;
  predictionAccuracy: number;
}

const StatsWidgets = ({ stats }: { stats: StatsData }) => {
  const widgets = [
    {
      icon: Radio,
      label: "Live Matches",
      value: stats.liveMatches,
      tone: "primary",
      detail: "Matches currently in-play across the live board.",
      featured: true,
    },
    {
      icon: TrendingUp,
      label: "Live Signals",
      value: stats.hotMatches,
      tone: "accent",
      detail: "In-play fixtures above the live alert threshold.",
    },
    {
      icon: BarChart3,
      label: "Tracked Fixtures",
      value: stats.alertsToday || "–",
      tone: "default",
      detail: "Total fixtures currently available in the feed.",
    },
    {
      icon: Target,
      label: "Leagues Covered",
      value: stats.predictionAccuracy || "–",
      tone: "default",
      detail: "Distinct competitions represented in the model cycle.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
      {widgets.map((widget) => (
        <div
          key={widget.label}
          className={`min-w-0 rounded-2xl border p-4 transition-colors ${
            widget.featured
              ? "border-primary/30 bg-card shadow-[0_16px_50px_-38px_rgba(132,204,22,0.75)]"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              widget.tone === "primary"
                ? "bg-primary/10 text-primary"
                : widget.tone === "accent"
                ? "bg-accent/10 text-accent"
                : "bg-secondary text-foreground"
            }`}>
              <widget.icon className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {widget.label}
            </span>
          </div>
          <div className={`mt-4 text-3xl font-black font-mono ${
            widget.tone === "primary" ? "text-primary" : widget.tone === "accent" ? "text-accent" : "text-foreground"
          }`}>
            {widget.value}
          </div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{widget.detail}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsWidgets;
