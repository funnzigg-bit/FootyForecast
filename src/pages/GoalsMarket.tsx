import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { BarChart3, Loader2 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { getPredictionAngle, isUpcomingPrediction, rankPredictions, uniquePredictionsByFixture } from "@/lib/predictionInsights";

const GoalsMarket = () => {
  const { data: predictions = [], isLoading, error } = usePredictionsData();

  const data = useMemo(
    () =>
      uniquePredictionsByFixture(
        rankPredictions(predictions.filter((prediction) => isUpcomingPrediction(prediction)))
      ).map((p) => ({
        matchId: p.id,
        league: p.league,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        homeLogo: p.homeLogo,
        awayLogo: p.awayLogo,
        over25Prob: p.over25Prob,
        over35Prob: p.over35Prob,
        bttsProb: p.bttsProb,
        totalGoalsExpected: p.totalGoalsExpected,
        angle: getPredictionAngle(p),
      })),
    [predictions]
  );

  const over25 = data.filter(d => d.over25Prob >= 65).sort((a, b) => b.over25Prob - a.over25Prob);
  const over35 = data.filter(d => d.over35Prob >= 40 || (d.totalGoalsExpected ?? 0) >= 3.25).sort((a, b) => b.over35Prob - a.over35Prob);
  const bttsYes = data.filter(d => d.bttsProb >= 60).sort((a, b) => b.bttsProb - a.bttsProb);

  const Section = ({ title, items, valueKey, label }: { title: string; items: typeof data; valueKey: 'over25Prob' | 'over35Prob' | 'bttsProb'; label: string }) => (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" /> {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(d => (
          <div key={d.matchId} className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors">
            <div className="text-[10px] text-muted-foreground mb-1">{d.league}</div>
            <div className="text-sm font-semibold text-foreground flex items-center gap-1 flex-wrap"><TeamBadge name={d.homeTeam} logo={d.homeLogo} size={16} /> <span className="text-muted-foreground">vs</span> <TeamBadge name={d.awayTeam} logo={d.awayLogo} size={16} /></div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className={`font-mono font-bold ${d[valueKey] >= 70 ? 'text-primary' : d[valueKey] >= 50 ? 'text-accent' : 'text-muted-foreground'}`}>
                {d[valueKey]}%
              </span>
            </div>
            {d.totalGoalsExpected != null && (
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>xGoals</span>
                <span className="font-mono text-foreground">{d.totalGoalsExpected.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full transition-all ${d[valueKey] >= 70 ? 'bg-primary' : d[valueKey] >= 50 ? 'bg-accent' : 'bg-muted-foreground'}`} style={{ width: `${d[valueKey]}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">{d.angle}</p>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-sm text-muted-foreground p-4 text-center">No matches found for this market.</div>}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Goals Market</h1>
          <p className="text-xs text-muted-foreground mt-1">Goal-focused predictions and probabilities · Real-time data</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load data. Please try again later.
          </div>
        ) : (
          <>
            <Section title="Over 2.5 Goals" items={over25} valueKey="over25Prob" label="Over 2.5 probability" />
            <Section title="Over 3.5 Goals" items={over35} valueKey="over35Prob" label="Over 3.5 probability" />
            <Section title="BTTS Yes" items={bttsYes} valueKey="bttsProb" label="BTTS probability" />
          </>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default GoalsMarket;
