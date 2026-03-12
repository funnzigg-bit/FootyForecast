import { Bell, Gauge, Goal, Radar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { AppAlertItem } from "@/types/userUtility";
import { Badge } from "@/components/ui/badge";

interface Props {
  alerts: AppAlertItem[];
}

const RecentAlerts = ({ alerts }: Props) => {
  const getIcon = (type: AppAlertItem["type"]) => {
    switch (type) {
      case "live_signal":
        return <Gauge className="h-3.5 w-3.5 text-primary" />;
      case "watched_match_live":
        return <Radar className="h-3.5 w-3.5 text-accent" />;
      case "value_edge":
        return <Star className="h-3.5 w-3.5 text-warning" />;
      default:
        return <Goal className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-[0_14px_40px_-34px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bell className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
        <Badge className="ml-auto bg-accent/15 text-accent border-accent/30 text-[10px]">
          {alerts.length}
        </Badge>
      </div>

      <div className="divide-y divide-border/30">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No alerts triggered yet. They appear here once live signals or market edges cross your thresholds.
          </div>
        ) : (
          alerts.slice(0, 6).map((alert) => (
            <Link
              key={alert.id}
              to={`/match/${alert.matchId}`}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/15"
            >
              <div className={`mt-0.5 rounded-lg border p-1.5 ${
                alert.severity === "high"
                  ? "border-primary/30 bg-primary/10"
                  : alert.severity === "watch"
                  ? "border-warning/30 bg-warning/10"
                  : "border-border/70 bg-background/70"
              }`}>
                {getIcon(alert.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-semibold text-foreground">{alert.title}</span>
                  {alert.probability != null && (
                    <span className="text-[10px] font-mono text-primary">{alert.probability}%</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{alert.message}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;
