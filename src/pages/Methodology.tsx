import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Database, Brain, BarChart3, Target, Shield, TrendingUp } from "lucide-react";

const factors = [
  { name: "Expected Goals (xG)", weight: "30%", desc: "Measures shot quality and expected scoring rate." },
  { name: "Defensive xGA (inverse)", weight: "20%", desc: "How many goals a team is expected to concede. Lower = better." },
  { name: "Shots on Target", weight: "15%", desc: "Direct measure of attacking threat and quality." },
  { name: "Recent Form (last 5)", weight: "10%", desc: "Win/draw/loss record in the last 5 matches." },
  { name: "Home Advantage", weight: "10%", desc: "Historical performance differential at home vs away." },
  { name: "Head to Head", weight: "5%", desc: "Historical results between the two teams." },
  { name: "Possession Efficiency", weight: "5%", desc: "How effectively a team uses possession to create chances." },
  { name: "Conversion Rate", weight: "5%", desc: "Percentage of shots converted to goals." },
];

const markets = [
  { name: "Match Result", desc: "Home Win / Draw / Away Win probabilities using logistic model." },
  { name: "Correct Score", desc: "Most likely scoreline based on expected goals." },
  { name: "Over 2.5 Goals", desc: "Probability of 3 or more goals in the match." },
  { name: "Over 3.5 Goals", desc: "Probability of 4 or more goals." },
  { name: "BTTS", desc: "Probability that both teams score at least once." },
  { name: "Upset Detection", desc: "Identifies underdogs with strong data indicators." },
];

const Methodology = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Methodology</h1>
          <p className="text-xs text-muted-foreground mt-1">How FootyForecast generates predictions</p>
        </div>

        {/* Data Inputs */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Data Inputs</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Our model uses the following weighted factors to calculate team strength scores. Each factor is normalised to a 0-1 scale before applying weights.
          </p>

          <div className="space-y-3">
            {factors.map(f => (
              <div key={f.name} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] shrink-0 mt-0.5">{f.weight}</Badge>
                <div>
                  <div className="text-sm font-medium text-foreground">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Prediction Formula</h2>
          </div>
          <div className="rounded-lg bg-secondary/30 p-4 font-mono text-xs text-foreground leading-relaxed">
            <div className="text-muted-foreground mb-2">// Team Strength Score</div>
            <div>TeamScore =</div>
            <div className="ml-4">0.30 × xG</div>
            <div className="ml-4">+ 0.20 × (1 - xGA)</div>
            <div className="ml-4">+ 0.15 × shotsOnTarget</div>
            <div className="ml-4">+ 0.10 × recentForm</div>
            <div className="ml-4">+ 0.10 × homeAdvantage</div>
            <div className="ml-4">+ 0.05 × headToHead</div>
            <div className="ml-4">+ 0.05 × possessionEfficiency</div>
            <div className="ml-4">+ 0.05 × conversionRate</div>
            <div className="mt-3 text-muted-foreground">// Probability via logistic function</div>
            <div>P(outcome) = 1 / (1 + e^(-diff))</div>
          </div>
        </div>

        {/* Markets */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Market Predictions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {markets.map(m => (
              <div key={m.name} className="p-3 rounded-lg bg-secondary/20">
                <div className="text-sm font-medium text-foreground">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-foreground">Confidence Scoring</h2>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Confidence is derived from the probability gap between outcomes and model agreement across markets.</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
                <div className="text-lg font-bold text-primary">80-100</div>
                <div className="text-[10px] text-primary">High</div>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-center">
                <div className="text-lg font-bold text-warning">60-79</div>
                <div className="text-[10px] text-warning">Medium</div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-3 text-center">
                <div className="text-lg font-bold text-muted-foreground">40-59</div>
                <div className="text-[10px] text-muted-foreground">Low</div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-destructive/30 bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-destructive" />
            <h2 className="text-base font-semibold text-destructive">Disclaimer</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FootyForecast predictions are for informational and entertainment purposes only. They should not be relied upon for financial decisions, betting, or gambling. Past performance does not guarantee future results. Always exercise your own judgment and gamble responsibly.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Methodology;
