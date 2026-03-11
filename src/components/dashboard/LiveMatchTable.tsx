import { useNavigate } from "react-router-dom";
import { MatchData } from "@/types/match";
import { PredictionResult } from "@/services/predictionEngine";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  matches: MatchData[];
  predictions: Map<string, PredictionResult>;
  watchedIds: Set<string>;
  onToggleWatch: (id: string) => void;
}

const getConfBadge = (conf: string) => {
  switch (conf) {
    case 'very_high': return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Very High</Badge>;
    case 'high': return <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">High</Badge>;
    case 'medium': return <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">Medium</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
  }
};

const WatchButton = ({ isWatched, onClick }: { isWatched: boolean; onClick: (e: React.MouseEvent) => void }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={`p-1 rounded transition-colors ${isWatched ? "text-warning hover:text-warning/70" : "text-muted-foreground/40 hover:text-warning"}`}
      >
        <Star className={`h-3.5 w-3.5 ${isWatched ? "fill-warning" : ""}`} />
      </button>
    </TooltipTrigger>
    <TooltipContent>{isWatched ? "Remove from watchlist" : "Add to watchlist"}</TooltipContent>
  </Tooltip>
);

// Mobile card view
const MatchCard = ({ m, pred, isWatched, onClick, onToggleWatch }: {
  m: MatchData; pred?: PredictionResult; isWatched: boolean;
  onClick: () => void; onToggleWatch: (e: React.MouseEvent) => void;
}) => {
  const prob = pred?.probabilityScore || 0;
  const isHot = pred?.triggerStatus;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/20 cursor-pointer ${isHot ? "bg-primary/[0.03] border-primary/20" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground truncate">{m.league}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            {m.status === 'halftime' ? 'HT' : `${m.minute}'`}
          </span>
          <WatchButton isWatched={isWatched} onClick={onToggleWatch} />
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{m.homeTeam}</div>
          <div className="text-sm font-medium text-foreground truncate">{m.awayTeam}</div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0 ml-3">
          <span className="font-mono text-sm font-bold text-foreground">{m.homeScore}</span>
          <span className="font-mono text-sm font-bold text-foreground">{m.awayScore}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-10 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${prob >= 70 ? "bg-primary" : prob >= 50 ? "bg-accent" : "bg-muted-foreground"}`}
              style={{ width: `${prob}%` }}
            />
          </div>
          <span className={`font-mono text-xs font-bold ${prob >= 70 ? "text-primary" : prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>
            {prob}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {pred && getConfBadge(pred.confidence)}
          {isHot && (
            <div className="flex items-center gap-0.5 text-primary">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px] font-semibold">HOT</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveMatchTable = ({ matches, predictions, watchedIds, onToggleWatch }: Props) => {
  const navigate = useNavigate();
  const sorted = [...matches].sort((a, b) => {
    const pa = predictions.get(a.id)?.probabilityScore || 0;
    const pb = predictions.get(b.id)?.probabilityScore || 0;
    return pb - pa;
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Live Matches</h3>
        <Link to="/live-matches" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <Eye className="h-3 w-3" />
        </Link>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden divide-y divide-border/20 p-2 space-y-2">
        {sorted.slice(0, 8).map((m) => (
          <MatchCard
            key={m.id}
            m={m}
            pred={predictions.get(m.id)}
            isWatched={watchedIds.has(m.id)}
            onClick={() => navigate(`/match/${m.id}`)}
            onToggleWatch={(e) => { e.stopPropagation(); onToggleWatch(m.id); }}
          />
        ))}
        {sorted.length > 8 && (
          <Link to="/live-matches" className="block text-center py-2 text-xs text-primary hover:underline">
            View all {sorted.length} matches
          </Link>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="px-2 py-2 text-center font-medium w-8">
                <Star className="h-3 w-3 mx-auto" />
              </th>
              <th className="px-3 py-2 text-left font-medium">League</th>
              <th className="px-3 py-2 text-left font-medium">Match</th>
              <th className="px-3 py-2 text-center font-medium">Score</th>
              <th className="px-3 py-2 text-center font-medium">Min</th>
              <th className="px-3 py-2 text-center font-medium">
                <Tooltip>
                  <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/50">SOT</TooltipTrigger>
                  <TooltipContent>Shots on Target</TooltipContent>
                </Tooltip>
              </th>
              <th className="px-3 py-2 text-center font-medium">
                <Tooltip>
                  <TooltipTrigger className="cursor-help border-b border-dashed border-muted-foreground/50">DA</TooltipTrigger>
                  <TooltipContent>Dangerous Attacks</TooltipContent>
                </Tooltip>
              </th>
              <th className="px-3 py-2 text-center font-medium">Prob.</th>
              <th className="px-3 py-2 text-center font-medium">Conf.</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const pred = predictions.get(m.id);
              const prob = pred?.probabilityScore || 0;
              const isHot = pred?.triggerStatus;
              const isWatched = watchedIds.has(m.id);
              return (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/match/${m.id}`)}
                  className={`border-b border-border/20 transition-colors hover:bg-secondary/20 cursor-pointer ${isHot ? "bg-primary/[0.03]" : ""}`}
                >
                  <td className="px-2 py-2.5 text-center">
                    <WatchButton
                      isWatched={isWatched}
                      onClick={(e) => { e.stopPropagation(); onToggleWatch(m.id); }}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[120px]">{m.league}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                    {m.homeTeam} vs {m.awayTeam}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-bold text-foreground">
                    {m.homeScore}-{m.awayScore}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-muted-foreground">
                    {m.status === 'halftime' ? 'HT' : `${m.minute}'`}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-muted-foreground">
                    {m.stats.homeShotsOnTarget + m.stats.awayShotsOnTarget}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-muted-foreground">
                    {m.stats.homeDangerousAttacks + m.stats.awayDangerousAttacks}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${prob >= 70 ? "bg-primary" : prob >= 50 ? "bg-accent" : "bg-muted-foreground"}`}
                          style={{ width: `${prob}%` }}
                        />
                      </div>
                      <span className={`font-mono font-bold ${prob >= 70 ? "text-primary" : prob >= 50 ? "text-accent" : "text-muted-foreground"}`}>
                        {prob}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {pred && getConfBadge(pred.confidence)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {isHot ? (
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">HOT</span>
                      </div>
                    ) : pred && pred.probabilityScore >= 50 ? (
                      <div className="flex items-center justify-center gap-1 text-watch">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-[10px]">WATCH</span>
                      </div>
                    ) : m.status === 'halftime' ? (
                      <span className="text-[10px] text-muted-foreground">HT</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveMatchTable;
