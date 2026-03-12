import { Radio } from "lucide-react";

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
    <div className="relative rounded-[28px] border border-border/80 bg-card/80 p-1 backdrop-blur-sm shadow-[0_30px_80px_-45px_rgba(0,0,0,0.85)]">
      <div className="absolute inset-0 z-10 overflow-hidden rounded-[28px] pointer-events-none">
        <div className="h-8 w-full bg-gradient-to-b from-primary/4 to-transparent animate-scan-line" />
      </div>

      <div className="rounded-[24px] border border-border/60 bg-background">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">FootyForecast editorial dashboard</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1">
            <Radio className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Live now</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr] gap-3 border-b border-border/50 p-4">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-left">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Match desk</div>
            <div className="mt-2 text-lg font-bold text-foreground">Live angles, ranked picks, and market reads in one scan.</div>
            <div className="mt-2 text-xs leading-5 text-muted-foreground">Pre-match confidence sits alongside current match-state pressure so the desk reads like a real football operations screen.</div>
          </div>
          {[
            { label: "Today's Picks", value: "24", color: "text-foreground" },
            { label: "High Confidence", value: "8", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/60 bg-secondary/25 p-3 text-center">
              <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

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
          {matches.map((match, index) => (
            <div
              key={match.home}
              className={`grid grid-cols-[1fr_2fr_1fr_0.7fr_0.7fr_0.7fr_0.8fr] items-center gap-2 px-4 py-3 text-xs transition-colors hover:bg-secondary/20 ${match.confidence >= 80 ? "bg-primary/[0.03]" : ""} ${index < matches.length - 1 ? "border-b border-border/20" : ""}`}
            >
              <div className="truncate text-muted-foreground">{match.league}</div>
              <div className="truncate font-medium text-foreground">{match.home} vs {match.away}</div>
              <div className="text-center font-medium text-foreground">{match.prediction}</div>
              <div className="text-center">
                <span className={`font-mono font-bold ${getConfColor(match.confidence)}`}>{match.confidence}%</span>
              </div>
              <div className="text-center font-mono text-muted-foreground">{match.over25}%</div>
              <div className="text-center">
                <span className={`text-[10px] font-medium ${match.btts === "Yes" ? "text-primary" : "text-muted-foreground"}`}>{match.btts}</span>
              </div>
              <div className="text-center font-mono font-bold text-foreground">{match.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
