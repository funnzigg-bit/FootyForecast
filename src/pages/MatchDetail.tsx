import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { usePredictionsWithOdds } from "@/hooks/useOddsData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Radio, Calendar } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { LiveIncident } from "@/services/liveDataService";
import { MatchPrediction } from "@/services/footballPredictionEngine";
import { formatDecimalOddsAsFractional } from "@/lib/oddsInsights";

const StatBar = ({ label, homeValue, awayValue, homeLabel, awayLabel, highlight }: {
  label: string; homeValue: number; awayValue: number;
  homeLabel?: string; awayLabel?: string; highlight?: boolean;
}) => {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono ${highlight && homeValue > awayValue ? "text-primary font-bold" : "text-foreground"}`}>
          {homeLabel ?? homeValue}
        </span>
        <span className="text-muted-foreground text-[10px]">{label}</span>
        <span className={`font-mono ${highlight && awayValue > homeValue ? "text-primary font-bold" : "text-foreground"}`}>
          {awayLabel ?? awayValue}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        <div className={`rounded-full transition-all ${homeValue > awayValue ? "bg-primary" : "bg-accent"}`} style={{ width: `${homePercent}%` }} />
        <div className={`rounded-full transition-all ${awayValue > homeValue ? "bg-primary" : "bg-accent"}`} style={{ width: `${100 - homePercent}%` }} />
      </div>
    </div>
  );
};

const WinProbBar = ({ home, draw, away, homeTeam, awayTeam }: { home: number; draw: number; away: number; homeTeam: string; awayTeam: string }) => (
  <div className="space-y-1.5 mt-3">
    <div className="flex items-center justify-between text-xs">
      <span className={`font-bold ${home >= draw && home >= away ? 'text-primary' : 'text-foreground'}`}>{homeTeam} {home}%</span>
      <span className="text-muted-foreground text-[10px]">Win Probability</span>
      <span className={`font-bold ${away >= draw && away >= home ? 'text-primary' : 'text-foreground'}`}>{away}% {awayTeam}</span>
    </div>
    <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
      <div className={`rounded-l-full ${home >= draw && home >= away ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${home}%` }} />
      <div className="bg-muted-foreground/30" style={{ width: `${draw}%` }} />
      <div className={`rounded-r-full ${away >= draw && away >= home ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${away}%` }} />
    </div>
    <div className="text-center text-[10px] text-muted-foreground">Draw {draw}%</div>
  </div>
);

const formatMatchDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

function normalizeLiveWinProbabilities(
  prediction: MatchPrediction,
  liveScore: { home: number; away: number; minute: number },
  stats?: {
    homeShotsOnTarget: number;
    awayShotsOnTarget: number;
    homeDangerousAttacks: number;
    awayDangerousAttacks: number;
    homePossession: number;
    awayPossession: number;
    homeRedCards: number;
    awayRedCards: number;
  } | null,
) {
  const minute = Math.max(1, liveScore.minute);
  const scoreDiff = liveScore.home - liveScore.away;
  const absDiff = Math.abs(scoreDiff);
  const remainingRatio = Math.max(0.04, (95 - Math.min(minute, 95)) / 95);

  const homePressure =
    (stats?.homeShotsOnTarget ?? 0) * 3 +
    (stats?.homeDangerousAttacks ?? 0) * 0.08 +
    (stats?.homePossession ?? 50) * 0.12 -
    (stats?.homeRedCards ?? 0) * 12;
  const awayPressure =
    (stats?.awayShotsOnTarget ?? 0) * 3 +
    (stats?.awayDangerousAttacks ?? 0) * 0.08 +
    (stats?.awayPossession ?? 50) * 0.12 -
    (stats?.awayRedCards ?? 0) * 12;

  const pressureSwing = Math.max(-10, Math.min(10, (homePressure - awayPressure) * 0.45 * remainingRatio));
  const leadWeight = absDiff * (18 + minute * 0.52);

  let home = prediction.homeWinProb;
  let draw = prediction.drawProb;
  let away = prediction.awayWinProb;

  if (scoreDiff > 0) {
    home += leadWeight;
    draw = Math.max(1, draw - absDiff * (7 + minute * 0.06));
    away = Math.max(1, away - leadWeight * 0.7);
  } else if (scoreDiff < 0) {
    away += leadWeight;
    draw = Math.max(1, draw - absDiff * (7 + minute * 0.06));
    home = Math.max(1, home - leadWeight * 0.7);
  } else {
    draw += 10 + minute * 0.18;
  }

  if (scoreDiff >= 2) draw = Math.max(1, draw - 6);
  if (scoreDiff <= -2) draw = Math.max(1, draw - 6);
  if (scoreDiff > 0) home += pressureSwing;
  if (scoreDiff < 0) away -= pressureSwing;
  if (scoreDiff === 0) {
    home += pressureSwing;
    away -= pressureSwing;
  }

  const raw = [
    Math.max(1, home),
    Math.max(1, draw),
    Math.max(1, away),
  ];
  const total = raw.reduce((sum, value) => sum + value, 0);
  const normalized = raw.map((value) => Math.round((value / total) * 100));
  const drift = 100 - normalized.reduce((sum, value) => sum + value, 0);
  normalized[0] += drift;

  return {
    home: normalized[0],
    draw: normalized[1],
    away: normalized[2],
  };
}

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: liveMatches = [] } = useLiveMatches(15000);
  const { data: rawPredictions = [] } = usePredictionsData();
  const { data: predictions = [] } = usePredictionsWithOdds(rawPredictions);

  // Find match in live matches or predictions
  const liveMatch = liveMatches.find(m => m.id === id);
  const prediction = predictions.find(p => p.id === id);

  const match = useMemo(() => {
    if (liveMatch) {
      return {
        id: liveMatch.id,
        league: liveMatch.league,
        leagueLogo: liveMatch.leagueLogo,
        homeTeam: liveMatch.homeTeam,
        awayTeam: liveMatch.awayTeam,
        homeLogo: liveMatch.homeLogo,
        awayLogo: liveMatch.awayLogo,
        homeScore: liveMatch.homeScore,
        awayScore: liveMatch.awayScore,
        minute: liveMatch.minute,
        status: liveMatch.status,
        stats: liveMatch.stats,
        matchDate: undefined as string | undefined,
        incidents: liveMatch.incidents || [],
      };
    }
    if (prediction) {
      return {
        id: prediction.id,
        league: prediction.league,
        leagueLogo: prediction.leagueLogo,
        homeTeam: prediction.homeTeam,
        awayTeam: prediction.awayTeam,
        homeLogo: prediction.homeLogo,
        awayLogo: prediction.awayLogo,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
        minute: prediction.minute || 0,
        status: prediction.status || 'scheduled',
        stats: null,
        matchDate: prediction.matchDate,
        incidents: [],
      };
    }
    return null;
  }, [liveMatch, prediction]);

  const liveCount = liveMatches.filter(m => m.status === 'live').length;
  const s = match?.stats ?? null;
  const liveProbabilities = useMemo(() => {
    if (!prediction || !match) return null;
    if (match.status !== 'live' && match.status !== 'halftime') {
      return {
        home: prediction.homeWinProb,
        draw: prediction.drawProb,
        away: prediction.awayWinProb,
      };
    }

    return normalizeLiveWinProbabilities(
      prediction,
      { home: match.homeScore, away: match.awayScore, minute: match.minute },
      s
    );
  }, [match, prediction, s]);

  if (!match) {
    return (
      <DashboardLayout liveMatchCount={liveCount}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Match not found</p>
          <Link to="/live"><Button variant="outline" size="sm" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Back to Live</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        <Link to="/live" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Live Matches
        </Link>

        {/* Scoreboard */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-secondary/20">
            <span className="text-xs text-muted-foreground">{match.league}</span>
            <div className="flex items-center gap-2">
              {match.status === 'live' && <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />}
              <span className="text-xs font-mono text-muted-foreground">
                {match.status === 'halftime' ? 'HALF TIME' : match.status === 'finished' ? 'FULL TIME' : match.status === 'scheduled' ? 'UPCOMING' : `${match.minute}'`}
              </span>
            </div>
          </div>

          {/* Match date for upcoming matches */}
          {match.status === 'scheduled' && match.matchDate && (
            <div className="flex items-center justify-center gap-1.5 px-4 py-2 bg-secondary/10 border-b border-border/30">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatMatchDate(match.matchDate)}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 sm:gap-8 py-6 sm:py-8 px-4">
            <div className="flex-1 text-right flex flex-col items-end gap-1">
              {match.homeLogo && <img src={match.homeLogo} alt="" className="h-8 w-8 object-contain" />}
              <div className="text-sm sm:text-lg font-bold text-foreground">{match.homeTeam}</div>
              <span className="text-[10px] text-muted-foreground">Home</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-5xl font-bold font-mono text-foreground">{match.homeScore}</span>
              <span className="text-xl sm:text-3xl text-muted-foreground">–</span>
              <span className="text-3xl sm:text-5xl font-bold font-mono text-foreground">{match.awayScore}</span>
            </div>
            <div className="flex-1 flex flex-col items-start gap-1">
              {match.awayLogo && <img src={match.awayLogo} alt="" className="h-8 w-8 object-contain" />}
              <div className="text-sm sm:text-lg font-bold text-foreground">{match.awayTeam}</div>
              <span className="text-[10px] text-muted-foreground">Away</span>
            </div>
          </div>

          {/* Win probabilities from prediction */}
          {prediction && liveProbabilities && (
            <div className="border-t border-border/50 px-4 py-4 bg-secondary/10">
              <WinProbBar
                home={liveProbabilities.home}
                draw={liveProbabilities.draw}
                away={liveProbabilities.away}
                homeTeam={prediction.homeTeam.split(' ').pop() || 'Home'}
                awayTeam={prediction.awayTeam.split(' ').pop() || 'Away'}
              />

              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-border/30">
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">Prediction</div>
                  <div className="text-xs font-bold text-foreground">{prediction.predictedResult}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">Score</div>
                  <div className="text-xs font-mono font-bold text-foreground">{prediction.predictedScore}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">BTTS</div>
                  <div className={`text-xs font-bold ${prediction.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{prediction.bttsResult}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground">Over 2.5</div>
                  <div className="text-xs font-mono font-bold text-foreground">{prediction.over25Prob}%</div>
                </div>
              </div>

              {prediction.odds && (
                <div className="mt-4 grid gap-2 rounded-lg border border-border/50 bg-background/60 p-3 sm:grid-cols-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Average price</div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      {prediction.odds.predictedSelection === "home"
                        ? formatDecimalOddsAsFractional(prediction.odds.home.averageOdds)
                        : prediction.odds.predictedSelection === "away"
                        ? formatDecimalOddsAsFractional(prediction.odds.away.averageOdds)
                        : formatDecimalOddsAsFractional(prediction.odds.draw.averageOdds)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Best price</div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      {prediction.odds.predictedSelection === "home"
                        ? formatDecimalOddsAsFractional(prediction.odds.home.bestOdds)
                        : prediction.odds.predictedSelection === "away"
                        ? formatDecimalOddsAsFractional(prediction.odds.away.bestOdds)
                        : formatDecimalOddsAsFractional(prediction.odds.draw.bestOdds)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Market probability</div>
                    <div className="text-xs font-mono font-bold text-foreground">
                      {prediction.odds.predictedSelection === "home"
                        ? prediction.odds.home.marketProbability?.toFixed(1)
                        : prediction.odds.predictedSelection === "away"
                        ? prediction.odds.away.marketProbability?.toFixed(1)
                        : prediction.odds.draw.marketProbability?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Model edge</div>
                    <div className={`text-xs font-mono font-bold ${(prediction.odds.predictedValueEdge ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                      {(prediction.odds.predictedValueEdge ?? 0) >= 0 ? "+" : ""}{prediction.odds.predictedValueEdge?.toFixed(1) ?? "0.0"}%
                    </div>
                  </div>
                </div>
              )}

              {prediction.reasoning && (
                <p className="mt-3 text-xs text-muted-foreground italic">{prediction.reasoning}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Stats */}
          {s && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent" /> Match Stats
              </h3>
              <div className="space-y-3">
                <StatBar label="Possession" homeValue={s.homePossession} awayValue={s.awayPossession} homeLabel={`${s.homePossession}%`} awayLabel={`${s.awayPossession}%`} />
                <StatBar label="Shots" homeValue={s.homeShots} awayValue={s.awayShots} highlight />
                <StatBar label="Shots on Target" homeValue={s.homeShotsOnTarget} awayValue={s.awayShotsOnTarget} highlight />
                <StatBar label="Corners" homeValue={s.homeCorners} awayValue={s.awayCorners} />
                <StatBar label="Yellow Cards" homeValue={s.homeYellowCards} awayValue={s.awayYellowCards} />
                <StatBar label="Red Cards" homeValue={s.homeRedCards} awayValue={s.awayRedCards} />
              </div>
            </div>
          )}

          {/* Match Events / Goalscorers */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Match Events
            </h3>
            <div className="space-y-2">
              {match.incidents && match.incidents.length > 0 ? (
                match.incidents.map((event: LiveIncident, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground w-6 text-right">{event.minute}'</span>
                    <div className={`h-2 w-2 rounded-full ${
                      event.type === 'goal' ? 'bg-primary' :
                      event.type === 'card' && event.cardType === 'red' ? 'bg-destructive' :
                      event.type === 'card' ? 'bg-warning' :
                      event.type === 'substitution' ? 'bg-accent' :
                      'bg-muted-foreground'
                    }`} />
                    <span className={`${event.type === 'goal' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {event.type === 'goal' ? '⚽ ' : event.type === 'card' ? '🟨 ' : ''}
                      {event.playerName || event.description || (event.type === 'goal' ? 'Goal' : event.type)}
                      <span className="text-muted-foreground font-normal ml-1">
                        ({event.isHome === undefined ? event.teamName || 'Match' : event.isHome ? match.homeTeam : match.awayTeam})
                      </span>
                    </span>
                  </div>
                ))
              ) : match.status === 'scheduled' ? (
                <p className="text-xs text-muted-foreground">Match hasn't started yet. Events will appear here during the game.</p>
              ) : (
                <p className="text-xs text-muted-foreground">No events available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MatchDetail;
