import { MatchData } from "@/types/match";
import { PredictionResult } from "@/services/predictionEngine";
import { Eye, EyeOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Props {
  matches: MatchData[];
  predictions: Map<string, PredictionResult>;
  watchedIds: Set<string>;
  onToggleWatch: (id: string) => void;
}

const WatchedGamesPanel = ({ matches, predictions, watchedIds, onToggleWatch }: Props) => {
  const navigate = useNavigate();
  const watchedMatches = matches.filter((m) => watchedIds.has(m.id));

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Eye className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Watchlist</h3>
        <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px] ml-auto">
          {watchedMatches.length} tracked
        </Badge>
      </div>

      <div className="divide-y divide-border/30">
        {watchedMatches.length === 0 ? (
          <div className="p-6 text-center">
            <EyeOff className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">No games being tracked</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click the ★ icon on any match to start tracking it
            </p>
          </div>
        ) : (
          watchedMatches.map((m) => {
            const pred = predictions.get(m.id);
            const prob = pred?.probabilityScore || 0;
            const isHot = pred?.triggerStatus;

            return (
              <div
                key={m.id}
                onClick={() => navigate(`/match/${m.id}`)}
                className={`group px-4 py-3 hover:bg-secondary/10 transition-colors cursor-pointer ${isHot ? "bg-primary/[0.02]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground truncate">{m.league}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {m.status === 'halftime' ? 'HT' : m.status === 'finished' ? 'FT' : `${m.minute}'`}
                      </span>
                      {isHot && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] py-0">HOT</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-foreground truncate">
                      {m.homeTeam} <span className="font-mono font-bold">{m.homeScore}-{m.awayScore}</span> {m.awayTeam}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono text-sm font-bold ${prob >= 70 ? "text-primary" : prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>
                      {prob}%
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWatch(m.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Remove from watchlist"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {pred && pred.activeSignals.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {pred.activeSignals.slice(0, 3).map((s) => (
                      <span key={s} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WatchedGamesPanel;
