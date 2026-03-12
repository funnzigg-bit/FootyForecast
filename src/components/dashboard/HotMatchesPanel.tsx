import { useNavigate } from "react-router-dom";
import { MatchData } from "@/types/match";
import { PredictionResult } from "@/services/predictionEngine";
import { TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  matches: MatchData[];
  predictions: Map<string, PredictionResult>;
}

const HotMatchesPanel = ({ matches, predictions }: Props) => {
  const navigate = useNavigate();
  const hotMatches = matches
    .filter((m) => {
      const pred = predictions.get(m.id);
      return pred && pred.probabilityScore >= 60;
    })
    .sort((a, b) => {
      const pa = predictions.get(a.id)?.probabilityScore || 0;
      const pb = predictions.get(b.id)?.probabilityScore || 0;
      return pb - pa;
    })
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Live Triggers</h3>
        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] ml-auto">
          {hotMatches.length} active
        </Badge>
      </div>

      <div className="divide-y divide-border/30">
        {hotMatches.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No live triggers detected right now
          </div>
        ) : (
          hotMatches.map((m) => {
            const pred = predictions.get(m.id)!;
            return (
              <div key={m.id} onClick={() => navigate(`/match/${m.id}`)} className="px-4 py-3 hover:bg-secondary/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-muted-foreground truncate">{m.league}</div>
                    <div className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {m.homeTeam} vs {m.awayTeam}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold font-mono ${pred.probabilityScore >= 75 ? "text-primary text-glow-green" : "text-accent"}`}>
                      {pred.probabilityScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">{pred.goalWindow}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {m.homeScore}-{m.awayScore}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{m.minute}'</span>
                  <div className="flex-1" />
                  {pred.activeSignals.slice(0, 3).map((s) => (
                    <span key={s} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                {pred.reasonSummary && (
                  <p className="mt-1.5 text-[10px] text-muted-foreground leading-relaxed italic">
                    {pred.reasonSummary}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HotMatchesPanel;
