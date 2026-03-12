import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Loader2, Calendar, Star, TrendingUp, Clock3 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { getConfidenceLabel } from "@/services/footballPredictionEngine";
import { getMarketLabel, getPredictionPriority, rankPredictions, sortPredictionsByKickoff, uniquePredictionsByFixture } from "@/lib/predictionInsights";

const getConfBadge = (level: string) => {
  const label = getConfidenceLabel(level);
  const cls = {
    elite: 'bg-primary/20 text-primary border-primary/30',
    high: 'bg-primary/15 text-primary border-primary/20',
    medium: 'bg-warning/20 text-warning border-warning/30',
    low: 'bg-muted text-muted-foreground border-border',
    very_risky: 'bg-destructive/20 text-destructive border-destructive/30',
  }[level] || 'bg-muted text-muted-foreground border-border';
  return <Badge className={`text-[10px] ${cls}`}>{label}</Badge>;
};

const getConfColor = (c: number) => {
  if (c >= 85) return 'text-primary';
  if (c >= 75) return 'text-primary/80';
  if (c >= 60) return 'text-warning';
  if (c >= 45) return 'text-muted-foreground';
  return 'text-destructive';
};

const getConfBarColor = (c: number) => {
  if (c >= 75) return 'bg-primary';
  if (c >= 60) return 'bg-accent';
  if (c >= 45) return 'bg-warning';
  return 'bg-destructive';
};

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

const getStatusBadge = (status?: string, minute?: number) => {
  switch (status) {
    case "live":
      return <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">Live {minute ?? 0}'</Badge>;
    case "halftime":
      return <Badge className="text-[9px] bg-warning/20 text-warning border-warning/30">HT</Badge>;
    case "finished":
      return <Badge className="text-[9px] bg-muted text-muted-foreground border-border">FT</Badge>;
    default:
      return <Badge className="text-[9px] bg-secondary text-muted-foreground border-border">Pre-match</Badge>;
  }
};

type QuickPreset = "all" | "today" | "live" | "high_confidence" | "value" | "goals";

const WinProbBar = ({ home, draw, away, homeTeam, awayTeam }: { home: number; draw: number; away: number; homeTeam: string; awayTeam: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[10px]">
      <span className={`font-bold ${home >= draw && home >= away ? 'text-primary' : 'text-foreground'}`}>{homeTeam} {home}%</span>
      <span className="text-muted-foreground">Draw {draw}%</span>
      <span className={`font-bold ${away >= draw && away >= home ? 'text-primary' : 'text-foreground'}`}>{away}% {awayTeam}</span>
    </div>
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      <div className={`rounded-l-full ${home >= draw && home >= away ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${home}%` }} />
      <div className="bg-muted-foreground/30" style={{ width: `${draw}%` }} />
      <div className={`rounded-r-full ${away >= draw && away >= home ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${away}%` }} />
    </div>
  </div>
);

const Predictions = () => {
  const { data: predictions = [], isLoading, error, dataUpdatedAt } = usePredictionsData();
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [confFilter, setConfFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quickPreset, setQuickPreset] = useState<QuickPreset>("all");
  const [sortKey, setSortKey] = useState<'date' | 'confidence' | 'league' | 'priority'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const rankedPredictions = uniquePredictionsByFixture(rankPredictions(predictions));
  const leagues = [...new Set(rankedPredictions.map(p => p.league))].sort();
  const todayDate = new Date().toDateString();
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const filtered = rankedPredictions.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.homeTeam.toLowerCase().includes(q) && !p.awayTeam.toLowerCase().includes(q) && !p.league.toLowerCase().includes(q)) return false;
    }
    if (leagueFilter !== "all" && p.league !== leagueFilter) return false;
    if (confFilter !== "all" && p.confidenceLevel !== confFilter) return false;
    if (statusFilter !== "all" && (p.status || "scheduled") !== statusFilter) return false;
    if (quickPreset === "today") {
      if (!p.matchDate || new Date(p.matchDate).toDateString() !== todayDate) return false;
    }
    if (quickPreset === "live" && (p.status || "scheduled") !== "live") return false;
    if (quickPreset === "high_confidence" && p.confidence < 75) return false;
    if (quickPreset === "value" && !p.isValue) return false;
    if (quickPreset === "goals" && p.over25Prob < 65 && p.bttsProb < 62) return false;
    return true;
  });

  const sorted = (
    sortKey === "date"
      ? sortPredictionsByKickoff(filtered)
      : [...filtered].sort((a, b) => {
          const cmp =
            sortKey === 'confidence'
              ? b.confidence - a.confidence
              : sortKey === 'priority'
              ? getPredictionPriority(b) - getPredictionPriority(a)
              : a.league.localeCompare(b.league);
          return cmp;
        })
  );

  if (sortAsc) sorted.reverse();

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Predictions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${predictions.length} matches · Enhanced ML engine with Poisson scoring`}
          </p>
          {updatedAt && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "live", label: "Live" },
            { id: "high_confidence", label: "High Confidence" },
            { id: "value", label: "Value" },
            { id: "goals", label: "Goals" },
          ].map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant={quickPreset === preset.id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setQuickPreset(preset.id as QuickPreset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teams or leagues..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm bg-card border-border" />
          </div>
          <Select value={leagueFilter} onValueChange={setLeagueFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-card border-border"><Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="All Leagues" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={confFilter} onValueChange={setConfFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs bg-card border-border"><SelectValue placeholder="All Confidence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="elite">Elite (85+)</SelectItem>
              <SelectItem value="high">High (75-84)</SelectItem>
              <SelectItem value="medium">Medium (60-74)</SelectItem>
              <SelectItem value="low">Low (45-59)</SelectItem>
              <SelectItem value="very_risky">Very Risky (&lt;45)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs bg-card border-border"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load predictions. Please try again later.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">
                        <button onClick={() => handleSort('league')} className="flex items-center gap-1 hover:text-foreground">League <ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Match</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-center font-medium">Win Probabilities</th>
                      <th className="px-4 py-3 text-center font-medium">
                        <button onClick={() => handleSort('confidence')} className="flex items-center gap-1 hover:text-foreground mx-auto">Conf. <ArrowUpDown className="h-3 w-3" /></button>
                      </th>
                      <th className="px-4 py-3 text-center font-medium">Top Scores</th>
                      <th className="px-4 py-3 text-center font-medium">BTTS</th>
                      <th className="px-4 py-3 text-center font-medium">O2.5</th>
                      <th className="px-4 py-3 text-center font-medium">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(p => (
                      <tr key={p.id} className="border-b border-border/20 transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{p.league}</td>
                        <td className="px-4 py-3">
                          <div className="mb-1">{getStatusBadge(p.status, p.minute)}</div>
                          <div className="font-medium text-foreground"><TeamBadge name={p.homeTeam} logo={p.homeLogo} size={14} /></div>
                          <div className="font-medium text-foreground mt-0.5"><TeamBadge name={p.awayTeam} logo={p.awayLogo} size={14} /></div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[10px] whitespace-nowrap">{formatMatchDate(p.matchDate)}</td>
                        <td className="px-4 py-3 min-w-[200px]">
                          <WinProbBar home={p.homeWinProb} draw={p.drawProb} away={p.awayWinProb} homeTeam="H" awayTeam="A" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-mono font-bold ${getConfColor(p.confidence)}`}>{p.confidence}%</span>
                            {getConfBadge(p.confidenceLevel)}
                            <span className="text-[9px] text-muted-foreground">P{getPredictionPriority(p)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="space-y-0.5">
                            {(p.topScores || []).slice(0, 3).map((s, i) => (
                              <div key={i} className="text-[10px]">
                                <span className="font-mono font-bold text-foreground">{s.score}</span>
                                <span className="text-muted-foreground ml-1">({s.probability}%)</span>
                              </div>
                            ))}
                            {!p.topScores?.length && <span className="font-mono font-bold text-foreground">{p.predictedScore}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-muted-foreground">{p.over25Prob}%</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {p.isValue && (
                              <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />Value
                              </Badge>
                            )}
                            {p.isUpset && (
                              <Badge className="text-[9px] bg-warning/20 text-warning border-warning/30">
                                <Star className="h-2.5 w-2.5 mr-0.5" />Upset
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sorted.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No predictions match your filters.</div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {sorted.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No predictions match your filters.</div>
              )}
              {sorted.map(p => (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{p.league}</span>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(p.status, p.minute)}
                        {p.isValue && <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">Value</Badge>}
                        {p.isUpset && <Badge className="text-[9px] bg-warning/20 text-warning border-warning/30">Upset</Badge>}
                      {getConfBadge(p.confidenceLevel)}
                    </div>
                  </div>

                  {p.status === 'scheduled' && p.matchDate && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatMatchDate(p.matchDate)}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate"><TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} /></div>
                    </div>
                    <div className="text-center shrink-0 px-2">
                      <div className="text-lg font-mono font-bold text-foreground">{p.predictedScore}</div>
                      <div className="text-[10px] text-muted-foreground">predicted</div>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm font-semibold text-foreground truncate flex justify-end"><TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} /></div>
                    </div>
                  </div>

                  <WinProbBar home={p.homeWinProb} draw={p.drawProb} away={p.awayWinProb} homeTeam={p.homeTeam.split(' ').pop() || 'Home'} awayTeam={p.awayTeam.split(' ').pop() || 'Away'} />

                  {/* Top 3 Correct Scores */}
                  {p.topScores && p.topScores.length > 0 && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-muted-foreground">Top scores:</span>
                      {p.topScores.map((s, i) => (
                        <span key={i} className="text-[10px]">
                          <span className="font-mono font-bold text-foreground">{s.score}</span>
                          <span className="text-muted-foreground ml-0.5">({s.probability}%)</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Best Angle</div>
                      <div className="text-xs font-medium text-foreground">{getMarketLabel(p)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">BTTS</div>
                      <div className={`text-xs font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>{p.bttsResult}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-muted-foreground">Priority</div>
                      <div className="text-xs font-mono text-muted-foreground">{getPredictionPriority(p)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">Confidence</span>
                    <span className={`font-mono font-bold text-xs ${getConfColor(p.confidence)}`}>{p.confidence}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${getConfBarColor(p.confidence)}`} style={{ width: `${p.confidence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Predictions are for informational purposes only. Not financial advice.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Predictions;
