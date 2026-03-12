import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpDown, Calendar, Loader2 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { PredictionSortMetric, sortPredictionsByMetric } from "@/lib/predictionInsights";

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

const UpsetWatch = () => {
  const { data: predictions = [], isLoading, error } = usePredictionsData();
  const [sortKey, setSortKey] = useState<PredictionSortMetric>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const upsets = useMemo(() => {
    const filtered = predictions.filter(p => p.isUpset && (p.upsetScore ?? 0) > 0);
    if (sortKey === "date") {
      return sortPredictionsByMetric(filtered, "date", sortAsc ? "asc" : "desc");
    }
    return sortPredictionsByMetric(filtered, sortKey, sortAsc ? "asc" : "desc");
  }, [predictions, sortAsc, sortKey]);

  const handleSort = (key: PredictionSortMetric) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sortButtons: { id: PredictionSortMetric; label: string }[] = [
    { id: "date", label: "Kickoff" },
    { id: "win_probability", label: "Win Probability" },
    { id: "confidence", label: "Confidence" },
    { id: "btts", label: "BTTS" },
    { id: "over25", label: "O2.5" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Upset Watch</h1>
          <p className="text-xs text-muted-foreground mt-1">Matches where underdogs show strong upset potential · Scored by multi-factor model</p>
        </div>

        <div className="rounded-2xl border border-warning/20 bg-card px-4 py-4 shadow-[0_18px_40px_-34px_rgba(245,158,11,0.45)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">Underdog desk</div>
              <div className="mt-1 text-sm font-semibold text-foreground">This view isolates fixtures where the underdog is carrying enough data to disrupt the favourite.</div>
              <div className="mt-1 text-xs text-muted-foreground">Use the upset score for scan speed, then read the reasoning before treating it as a live angle or daily pick.</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sort by</span>
          {sortButtons.map((button) => (
            <Button
              key={button.id}
              type="button"
              size="sm"
              variant={sortKey === button.id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => handleSort(button.id)}
            >
              {button.label}
              {sortKey === button.id && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load data.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">Match</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-center font-medium">Underdog</th>
                      <th className="px-4 py-3 text-center font-medium">Upset Score</th>
                      <th className="px-4 py-3 text-center font-medium">Risk</th>
                      <th className="px-4 py-3 text-left font-medium">Reasoning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upsets.map(p => {
                      const underdog = p.homeWinProb < p.awayWinProb ? p.homeTeam : p.awayTeam;
                      return (
                        <tr key={p.id} className="border-b border-border/20 transition-colors hover:bg-secondary/20">
                          <td className="px-4 py-3">
                            <div className="text-[10px] text-muted-foreground">{p.league}</div>
                            <div className="font-medium text-foreground flex items-center gap-1 flex-wrap">
                              <TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} />
                              <span className="text-muted-foreground">vs</span>
                              <TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-muted-foreground whitespace-nowrap">{formatMatchDate(p.matchDate)}</td>
                          <td className="px-4 py-3 text-center font-medium text-warning">{underdog}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-mono font-bold text-warning">{p.upsetScore}%</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-[10px] ${
                              p.riskLevel === 'High' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                              p.riskLevel === 'Medium' ? 'bg-warning/20 text-warning border-warning/30' :
                              'bg-primary/20 text-primary border-primary/30'
                            }`}>{p.riskLevel}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{p.reasoning}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {upsets.length === 0 && (
                <div className="p-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upset predictions identified.</p>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {upsets.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upset predictions identified.</p>
                </div>
              )}
              {upsets.map(p => {
                const underdog = p.homeWinProb < p.awayWinProb ? p.homeTeam : p.awayTeam;
                return (
                  <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{p.league}</span>
                      <Badge className={`text-[10px] ${
                        p.riskLevel === 'High' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                        p.riskLevel === 'Medium' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-primary/20 text-primary border-primary/30'
                      }`}>{p.riskLevel} Risk</Badge>
                    </div>
                    {p.matchDate && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />{formatMatchDate(p.matchDate)}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1 flex-wrap">
                      <TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} />
                      <span className="text-muted-foreground">vs</span>
                      <TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Underdog</span>
                      <span className="font-medium text-warning">{underdog}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Upset Score</span>
                      <span className="font-mono font-bold text-warning">{p.upsetScore}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${p.upsetScore}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{p.reasoning}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Upset predictions carry higher risk. For informational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default UpsetWatch;
