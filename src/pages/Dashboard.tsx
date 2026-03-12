import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsWidgets from "@/components/dashboard/StatsWidgets";
import LiveMatchTable from "@/components/dashboard/LiveMatchTable";
import HotMatchesPanel from "@/components/dashboard/HotMatchesPanel";
import WatchedGamesPanel from "@/components/dashboard/WatchedGamesPanel";
import { useLiveMatches, usePredictions } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { LiveMatch } from "@/services/liveDataService";
import { Loader2, Radio, WifiOff } from "lucide-react";

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

  const liveCount = matches.filter((match: LiveMatch) => match.status === "live").length;
  const hotCount = Array.from(predictions.values()).filter((prediction) => prediction.probabilityScore >= 62).length;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const uniqueLeagues = new Set(allPredictions.map((prediction) => prediction.league)).size;
  const marketPulse = matches
    .filter((match: LiveMatch) => match.status === "live")
    .map((match: LiveMatch) => ({
      match,
      prediction: predictions.get(match.id),
    }))
    .filter((entry) => entry.prediction)
    .sort((a, b) => (b.prediction?.probabilityScore || 0) - (a.prediction?.probabilityScore || 0))
    .slice(0, 3);

  const stats = {
    liveMatches: liveCount,
    hotMatches: hotCount,
    alertsToday: allPredictions.length,
    predictionAccuracy: uniqueLeagues,
  };

  const adaptedMatches = matches.map((match: LiveMatch) => ({
    id: match.id,
    league: match.league,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeLogo: match.homeLogo,
    awayLogo: match.awayLogo,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    minute: match.minute,
    status: match.status,
    stats: match.stats,
  }));

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4 sm:space-y-6">
        <StatsWidgets stats={stats} />

        <div className="rounded-2xl border border-border/80 bg-card/85 px-4 py-3 shadow-[0_16px_40px_-34px_rgba(0,0,0,0.85)]">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              Loading live matches...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs">
              <WifiOff className="h-3 w-3 text-destructive" />
              <span className="text-destructive">Failed to load — retrying...</span>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Live desk</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{liveCount} live matches on the board, refreshed {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Use this view for real-time match-state movement. Pre-match picks remain visible, but the live engine adjusts with score, minute, and pressure.</div>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {marketPulse.length > 0 ? marketPulse.map(({ match, prediction }) => (
                  <div key={match.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{prediction?.goalWindow}</div>
                    <div className="mt-1 truncate text-xs font-semibold text-foreground">{match.homeTeam} vs {match.awayTeam}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{prediction?.probabilityScore}% live signal</div>
                  </div>
                )) : (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground lg:col-span-3">
                    No live signal rail yet. It appears once in-play fixtures carry enough pressure data.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Live engine</span>
            <p className="mt-1">In-game alerts and live probabilities refresh roughly every 30 seconds.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Pre-match vs live</span>
            <p className="mt-1">Pre-match picks rank the fixture; live views shift with scoreline, minute, and pressure.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Coverage</span>
            <p className="mt-1">{allPredictions.length} fixtures currently tracked across {uniqueLeagues} leagues.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live board</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">Current matches and in-play probability signals</h2>
            </div>
            <LiveMatchTable matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Watch and rank</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">Fixtures worth monitoring right now</h2>
            </div>
            <WatchedGamesPanel matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
            <HotMatchesPanel matches={adaptedMatches} predictions={predictions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
