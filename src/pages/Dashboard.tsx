import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsWidgets from "@/components/dashboard/StatsWidgets";
import LiveMatchTable from "@/components/dashboard/LiveMatchTable";
import HotMatchesPanel from "@/components/dashboard/HotMatchesPanel";
import WatchedGamesPanel from "@/components/dashboard/WatchedGamesPanel";
import { useLiveMatches, usePredictions } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { LiveMatch } from "@/services/liveDataService";
import { Loader2, WifiOff } from "lucide-react";

const Dashboard = () => {
  const { data: matches = [], isLoading, error, dataUpdatedAt } = useLiveMatches(30000);
  const { data: allPredictions = [] } = usePredictionsData();
  const predictions = usePredictions(matches);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(() => new Set());

  const toggleWatch = (id: string) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const liveCount = matches.filter((m: LiveMatch) => m.status === 'live').length;
  const hotCount = Array.from(predictions.values()).filter(p => p.probabilityScore >= 62).length;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const uniqueLeagues = new Set(allPredictions.map(p => p.league)).size;

  const stats = {
    liveMatches: liveCount,
    hotMatches: hotCount,
    alertsToday: allPredictions.length,
    predictionAccuracy: uniqueLeagues,
  };

  const adaptedMatches = matches.map((m: LiveMatch) => ({
    id: m.id,
    league: m.league,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeLogo: m.homeLogo,
    awayLogo: m.awayLogo,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    minute: m.minute,
    status: m.status,
    stats: m.stats,
  }));

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4 sm:space-y-6">
        <StatsWidgets stats={stats} />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              Loading live matches...
            </>
          ) : error ? (
            <>
              <WifiOff className="h-3 w-3 text-destructive" />
              <span className="text-destructive">Failed to load — retrying...</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              {liveCount} live matches · Updated {lastUpdated.toLocaleTimeString()}
            </>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <LiveMatchTable matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <WatchedGamesPanel matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
            <HotMatchesPanel matches={adaptedMatches} predictions={predictions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
