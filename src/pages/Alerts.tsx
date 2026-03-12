import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveMatches, usePredictions } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { usePredictionsWithOdds } from "@/hooks/useOddsData";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistentWatchlist } from "@/hooks/usePersistentWatchlist";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useDerivedAlerts } from "@/hooks/useDerivedAlerts";
import { Badge } from "@/components/ui/badge";

const Alerts = () => {
  const { user } = useAuth();
  const { data: liveMatches = [] } = useLiveMatches(30000);
  const { data: rawPredictions = [] } = usePredictionsData();
  const { data: predictions = [] } = usePredictionsWithOdds(rawPredictions);
  const livePredictions = usePredictions(liveMatches);
  const { watchedIds } = usePersistentWatchlist(user?.id);
  const { settings } = useUserPreferences();
  const { alerts, clearAlerts } = useDerivedAlerts(user?.id, liveMatches, livePredictions, predictions, watchedIds, settings);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
          <h1 className="text-xl font-bold text-foreground">Alert History</h1>
            <p className="text-xs text-muted-foreground mt-1">Live triggers, value edges, and market-watch notifications</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="text-xs" onClick={clearAlerts}>
            <Trash2 className="mr-1 h-3 w-3" />Clear
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] text-muted-foreground">Alert style</div>
            <div className="mt-1 text-sm font-semibold text-foreground capitalize">{settings.alertStyle}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] text-muted-foreground">Alert channel</div>
            <div className="mt-1 text-sm font-semibold text-foreground capitalize">{settings.alertChannel}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] text-muted-foreground">Tracked matches</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{watchedIds.size}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Bell className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Recent notifications</h2>
            <Badge className="ml-auto bg-accent/15 text-accent border-accent/30 text-[10px]">{alerts.length}</Badge>
          </div>
          <div className="divide-y divide-border/20">
            {alerts.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No alerts triggered yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Alerts will populate here as live matches move or strong pre-match edges appear.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{alert.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{alert.message}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {alert.league} · {new Date(alert.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {alert.probability != null && (
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-muted-foreground">Signal</div>
                      <div className="font-mono font-bold text-primary">{alert.probability}%</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
