import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

const matches = [
  { league: "Premier League", home: "Arsenal", away: "Brighton", prediction: "Home Win", confidence: 82, btts: "No", over25: 58, score: "2-0" },
  { league: "La Liga", home: "Barcelona", away: "Valencia", prediction: "Home Win", confidence: 85, btts: "Yes", over25: 78, score: "3-1" },
  { league: "Champions League", home: "Real Madrid", away: "PSG", prediction: "Home Win", confidence: 58, btts: "Yes", over25: 68, score: "2-1" },
  { league: "Serie A", home: "Roma", away: "Atalanta", prediction: "Draw", confidence: 61, btts: "Yes", over25: 52, score: "1-1" },
  { league: "Bundesliga", home: "Bayern", away: "RB Leipzig", prediction: "Home Win", confidence: 74, btts: "Yes", over25: 82, score: "3-1" },
];

const getConfColor = (conf: number) => {
  if (conf >= 80) return "text-primary";
  if (conf >= 60) return "text-accent";
  return "text-warning";
};

const DashboardPreview = () => {
  return (
    <div className="relative rounded-xl border border-border bg-card/80 p-1 backdrop-blur-sm glow-green" style={{ boxShadow: '0 0 80px hsl(90 85% 45% / 0.08), 0 25px 50px -12px rgb(0 0 0 / 0.5)' }}>
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-10">
        <div className="h-8 w-full bg-gradient-to-b from-primary/5 to-transparent animate-scan-line" />
      </div>

      <div className="rounded-lg border border-border/50 bg-background">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">FootyForecast — Predictions Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-primary font-mono">UPDATED</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 border-b border-border/50 p-4">
          {[
            { label: "Today's Picks", value: "24", color: "text-foreground" },
            { label: "High Confidence", value: "8", color: "text-primary" },
            { label: "Leagues", value: "11", color: "text-accent" },
            { label: "Accuracy", value: "68%", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 bg-secondary/30 p-3 text-center">
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_1fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 border-b border-border/30 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>League</div>
            <div>Match</div>
            <div className="text-center">Prediction</div>
            <div className="text-center">Conf.</div>
            <div className="text-center">O2.5</div>
            <div className="text-center">BTTS</div>
            <div className="text-center">Score</div>
          </div>
          {matches.map((m, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_2fr_1fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 items-center px-4 py-2.5 text-xs transition-colors hover:bg-secondary/20 ${m.confidence >= 80 ? "bg-primary/[0.03]" : ""} ${i < matches.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div className="text-muted-foreground truncate">{m.league}</div>
              <div className="font-medium text-foreground truncate">{m.home} vs {m.away}</div>
              <div className="text-center text-foreground font-medium">{m.prediction}</div>
              <div className="text-center">
                <span className={`font-mono font-bold ${getConfColor(m.confidence)}`}>{m.confidence}%</span>
              </div>
              <div className="text-center font-mono text-muted-foreground">{m.over25}%</div>
              <div className="text-center">
                <span className={`text-[10px] font-medium ${m.btts === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{m.btts}</span>
              </div>
              <div className="text-center font-mono font-bold text-foreground">{m.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
