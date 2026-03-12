import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsWidgets from "@/components/dashboard/StatsWidgets";
import LiveMatchTable from "@/components/dashboard/LiveMatchTable";
import HotMatchesPanel from "@/components/dashboard/HotMatchesPanel";
import WatchedGamesPanel from "@/components/dashboard/WatchedGamesPanel";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import { useLiveMatches, usePredictions } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { usePredictionsWithOdds } from "@/hooks/useOddsData";
import { usePersistentWatchlist } from "@/hooks/usePersistentWatchlist";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useDerivedAlerts } from "@/hooks/useDerivedAlerts";
import { LiveMatch } from "@/services/liveDataService";
import { Loader2, Radio, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDecimalOddsAsFractional } from "@/lib/oddsInsights";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: matches = [], isLoading, error, dataUpdatedAt } = useLiveMatches(30000);
  const { data: rawPredictions = [] } = usePredictionsData();
  const { data: allPredictions = [] } = usePredictionsWithOdds(rawPredictions);
  const { settings } = useUserPreferences();
  const predictions = usePredictions(matches);
  const { watchedIds, toggleWatch } = usePersistentWatchlist(user?.id);

  const liveCount = matches.filter((match: LiveMatch) => match.status === "live").length;
  const hotCount = Array.from(predictions.values()).filter((prediction) => prediction.probabilityScore >= 62).length;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();
  const uniqueLeagues = new Set(allPredictions.map((prediction) => prediction.league)).size;
  const { alerts } = useDerivedAlerts(user?.id, matches, predictions, allPredictions, watchedIds, settings);
  const marketPulse = matches
    .filter((match: LiveMatch) => match.status === "live")
    .map((match: LiveMatch) => ({
      match,
      prediction: predictions.get(match.id),
    }))
    .filter((entry) => entry.prediction)
    .sort((a, b) => (b.prediction?.probabilityScore || 0) - (a.prediction?.probabilityScore || 0))
    .slice(0, 3);
  const bestValueEdges = allPredictions
    .filter((prediction) => prediction.odds?.predictedValueEdge != null)
    .sort((left, right) => (right.odds?.predictedValueEdge ?? 0) - (left.odds?.predictedValueEdge ?? 0))
    .slice(0, 3);

  const stats = {
    liveMatches: liveCount,
    hotMatches: hotCount,
    alertsToday: alerts.length,
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
      <div className="space-y-4 sm:space-y-5">
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

        <div className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live board</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">Current matches and in-play probability signals</h2>
            </div>
            <LiveMatchTable matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Monitoring rail</div>
              <h2 className="mt-1 text-xl font-bold text-foreground">Watchlist, alerts, and live triggers</h2>
            </div>
            <WatchedGamesPanel matches={adaptedMatches} predictions={predictions} watchedIds={watchedIds} onToggleWatch={toggleWatch} />
            <RecentAlerts alerts={alerts} />
            <HotMatchesPanel matches={adaptedMatches} predictions={predictions} />
            <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Operational note</span>
              <p className="mt-1">Pre-match picks stay stable, but live views shift with scoreline, minute, and pressure. Use the live board for timing, not just ranking.</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Market snapshot</div>
              <h2 className="mt-1 text-base font-bold text-foreground">Best model edges against the average odds board</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {bestValueEdges.length > 0 ? bestValueEdges.map((prediction) => (
              <div key={prediction.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{prediction.league}</div>
                <div className="mt-1 text-sm font-semibold text-foreground">{prediction.homeTeam} vs {prediction.awayTeam}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{prediction.predictedResult}</span>
                  <span className="font-mono font-bold text-primary">+{prediction.odds?.predictedValueEdge?.toFixed(1)}%</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Market {prediction.odds?.predictedSelection === "home" ? prediction.odds?.home.marketProbability : prediction.odds?.predictedSelection === "away" ? prediction.odds?.away.marketProbability : prediction.odds?.draw.marketProbability}% ·
                  Best {formatDecimalOddsAsFractional(
                    settings.oddsDisplay === "best"
                      ? prediction.odds?.predictedSelection === "home" ? prediction.odds?.home.bestOdds : prediction.odds?.predictedSelection === "away" ? prediction.odds?.away.bestOdds : prediction.odds?.draw.bestOdds
                      : prediction.odds?.predictedSelection === "home" ? prediction.odds?.home.averageOdds : prediction.odds?.predictedSelection === "away" ? prediction.odds?.away.averageOdds : prediction.odds?.draw.averageOdds
                  )}
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground lg:col-span-3">
                Odds-backed value edges appear here once market prices are available for current fixtures.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
