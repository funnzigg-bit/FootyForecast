import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Target, BarChart3, TrendingUp, Zap, Crown, Loader2, Calendar } from "lucide-react";
import { MatchPrediction, getConfidenceLabel } from "@/services/footballPredictionEngine";
import TeamBadge from "@/components/TeamBadge";
import { getMarketLabel, getPredictionAngle, getPredictionPriority, getScorelineLean, isPredictionToday, isUpcomingPrediction, rankPredictions, uniquePredictionsByFixture } from "@/lib/predictionInsights";

const formatMatchDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })} ${time}`;
};

const getConfColor = (c: number) => {
  if (c >= 85) return 'text-primary';
  if (c >= 75) return 'text-primary/80';
  if (c >= 60) return 'text-warning';
  return 'text-muted-foreground';
};

const PickCard = ({ p }: { p: MatchPrediction }) => (
  <div className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] text-muted-foreground">{p.league}</span>
      <div className="flex items-center gap-1">
        {p.isValue && <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">Value</Badge>}
        <Badge className={`text-[10px] ${
          p.confidenceLevel === 'elite' ? 'bg-primary/20 text-primary border-primary/30' :
          p.confidenceLevel === 'high' ? 'bg-primary/15 text-primary border-primary/20' :
          p.confidenceLevel === 'medium' ? 'bg-warning/20 text-warning border-warning/30' :
          'bg-secondary text-muted-foreground border-border'
        }`}>{p.confidence}% {getConfidenceLabel(p.confidenceLevel)}</Badge>
      </div>
    </div>
    {p.matchDate && (
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
        <Calendar className="h-3 w-3" />{formatMatchDate(p.matchDate)}
      </div>
    )}
    <div className="text-sm font-semibold text-foreground flex items-center gap-1 flex-wrap">
      <TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} />
      <span className="text-muted-foreground">vs</span>
      <TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} />
    </div>
    <div className="mt-2 flex items-center justify-between text-xs">
      <span className="text-muted-foreground">Best angle</span>
      <span className="font-medium text-foreground">{getMarketLabel(p)}</span>
    </div>
    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
      <span>Score lean</span>
      <span className="font-mono text-foreground">{getScorelineLean(p)}</span>
    </div>
    {p.totalGoalsExpected != null && (
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Expected goals</span>
        <span className="font-mono text-foreground">{p.totalGoalsExpected.toFixed(2)}</span>
      </div>
    )}
    <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">{getPredictionAngle(p)}</p>
  </div>
);

const DailyPicks = () => {
  const { data: predictions = [], isLoading, error } = usePredictionsData();

  const { pickOfDay, picks } = useMemo(() => {
    const source = uniquePredictionsByFixture(
      rankPredictions(
        predictions.filter((prediction) => isUpcomingPrediction(prediction))
      )
    );
    const todayPredictions = source.filter((prediction) => isPredictionToday(prediction));
    const ranked = rankPredictions(todayPredictions.length > 0 ? todayPredictions : source);
    const distinct = (list: MatchPrediction[]) => uniquePredictionsByFixture(rankPredictions(list));

    return {
      pickOfDay: ranked[0] || null,
      picks: {
        resultPicks: distinct(ranked.filter(p => getMarketLabel(p) === p.predictedResult && p.confidence >= 65)).slice(0, 4),
        goalsPicks: distinct(ranked.filter(p => p.over25Prob >= 66 || (p.totalGoalsExpected ?? 0) >= 2.9)).slice(0, 4),
        bttsPicks: distinct(ranked.filter(p => p.bttsProb >= 62)).slice(0, 4),
        valuePicks: distinct(ranked.filter(p => p.isValue || (p.valueEdge ?? 0) >= 5)).slice(0, 4),
      },
    };
  }, [predictions]);

  const sections = [
    { title: "Best Result Picks", icon: Target, data: picks.resultPicks },
    { title: "Best Goals Picks", icon: BarChart3, data: picks.goalsPicks },
    { title: "BTTS Picks", icon: TrendingUp, data: picks.bttsPicks },
    { title: "Value Picks", icon: Zap, data: picks.valuePicks },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Picks</h1>
          <p className="text-xs text-muted-foreground mt-1">Curated predictions · Real-time data with enhanced scoring</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load picks.
          </div>
        ) : (
          <>
            {/* Pick of the Day */}
            {pickOfDay && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Pick of the Day</h2>
                </div>
                <div className="rounded-xl border-2 border-primary/30 bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{pickOfDay.league}</span>
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                      <Crown className="h-3 w-3 mr-1" />Pick Score: {pickOfDay.pickScore}
                    </Badge>
                  </div>
                  {pickOfDay.matchDate && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />{formatMatchDate(pickOfDay.matchDate)}
                    </div>
                  )}
                  <div className="text-base font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                    <TeamBadge name={pickOfDay.homeTeam} logo={pickOfDay.homeLogo} size={20} />
                    <span className="text-muted-foreground text-sm">vs</span>
                    <TeamBadge name={pickOfDay.awayTeam} logo={pickOfDay.awayLogo} size={20} />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Best angle: </span>
                      <span className="font-bold text-foreground">{getMarketLabel(pickOfDay)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Confidence: </span>
                      <span className={`font-mono font-bold ${getConfColor(pickOfDay.confidence)}`}>{pickOfDay.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Priority: </span>
                      <span className="font-mono font-bold text-foreground">{getPredictionPriority(pickOfDay)}</span>
                    </div>
                  </div>
                  {pickOfDay.topScores && pickOfDay.topScores.length > 0 && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">Top scores:</span>
                      {pickOfDay.topScores.map((s, i) => (
                        <span key={i}><span className="font-mono font-bold text-foreground">{s.score}</span> <span className="text-muted-foreground">({s.probability}%)</span></span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{getPredictionAngle(pickOfDay)}</p>
                </div>
              </div>
            )}

            {sections.map(section => (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {section.data.length > 0 ? section.data.map(p => (
                    <PickCard key={p.id} p={p} />
                  )) : (
                    <div className="col-span-full text-sm text-muted-foreground p-4 text-center">No picks available for this category.</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DailyPicks;
