import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useLiveMatches } from "@/hooks/useLiveMatches";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { useLiveOddsMap } from "@/hooks/useOddsData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2, WifiOff } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { getFixtureSortTimestamp } from "@/lib/predictionInsights";

const LiveMatches = () => {
  const navigate = useNavigate();
  const { data: liveMatches = [], isLoading: liveLoading, error: liveError } = useLiveMatches(30000);
  const { data: predictions = [], isLoading: predLoading } = usePredictionsData();
  const { data: oddsMap } = useLiveOddsMap(liveMatches);
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isLoading = liveLoading && predLoading;
  const error = liveError;

  // Merge: live matches first, then today's scheduled/finished from predictions
  const today = new Date().toISOString().split('T')[0];
  const liveIds = new Set(liveMatches.map(m => m.id));
  const liveFixtureIds = new Set(liveMatches.map(m => String(m.fixtureId)));
  const todayPredictions = predictions
    .filter((p) => {
      const predictionDay = p.matchDate?.slice(0, 10);
      const predictionFixtureId = String(p.fixtureId ?? p.id);
      return predictionDay === today && !liveIds.has(p.id) && !liveFixtureIds.has(predictionFixtureId);
    })
    .map(p => ({
      id: p.id,
      fixtureId: Number(p.fixtureId ?? p.id),
      league: p.league,
      leagueLogo: p.leagueLogo,
      homeTeam: p.homeTeam,
      awayTeam: p.awayTeam,
      homeLogo: p.homeLogo,
      awayLogo: p.awayLogo,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      minute: p.minute || 0,
      status: p.status as 'live' | 'finished' | 'halftime' | 'scheduled',
      predictedResult: p.predictedResult,
      confidence: p.confidence,
      matchDate: p.matchDate,
    }));

  const allMatches = [
    ...liveMatches.map(m => ({
      ...m,
      predictedResult: undefined as string | undefined,
      confidence: undefined as number | undefined,
      matchDate: undefined as string | undefined,
    })),
    ...todayPredictions,
  ];

  const leagues = [...new Set(allMatches.map(m => m.league))].sort();
  const liveCount = allMatches.filter(m => m.status === 'live').length;

  const filtered = allMatches.filter(m => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q) && !m.league.toLowerCase().includes(q)) return false;
    }
    if (leagueFilter !== "all" && m.league !== leagueFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  filtered.sort((a, b) => (
    getFixtureSortTimestamp({ matchDate: a.matchDate, status: a.status }) -
    getFixtureSortTimestamp({ matchDate: b.matchDate, status: b.status })
  ));

  const getStatusBadge = (status: string, minute: number, matchDate?: string) => {
    if (status === 'live') return (
      <div className="flex items-center gap-1 text-primary">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-[10px] font-semibold">LIVE {minute}'</span>
      </div>
    );
    if (status === 'halftime') return <span className="text-[10px] font-semibold text-warning">HT</span>;
    if (status === 'finished') return <span className="text-[10px] text-muted-foreground">FT</span>;
    return <span className="text-[10px] text-muted-foreground">{matchDate ? formatMatchTime(matchDate) : 'Scheduled'}</span>;
  };

  const formatMatchTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today ${time}`;
    if (isTomorrow) return `Tom ${time}`;
    return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
  };

  return (
    <DashboardLayout liveMatchCount={liveCount}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Live & Today</h1>
            <p className="text-xs text-muted-foreground mt-1">{liveCount} live · {allMatches.length} total today · Auto-refreshing</p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : error ? (
              <WifiOff className="h-3 w-3 text-destructive" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            )}
            <span className="text-xs font-mono text-primary">LIVE</span>
          </div>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-card border-border"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error && allMatches.length === 0 ? (
          <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
            Failed to load matches. Retrying...
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">League</th>
                      <th className="px-4 py-3 text-left font-medium">Home</th>
                      <th className="px-4 py-3 text-center font-medium">Score</th>
                      <th className="px-4 py-3 text-left font-medium">Away</th>
                      <th className="px-4 py-3 text-center font-medium">Status</th>
                      <th className="px-4 py-3 text-center font-medium">Avg H2H</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => {
                      const oddsEvent = oddsMap.get(m.id);
                      const market = oddsEvent?.bookmakers[0]?.markets.find((entry) => entry.key === "h2h");
                      return (
                      <tr key={m.id} onClick={() => navigate(`/match/${m.id}`)} className="border-b border-border/20 transition-colors hover:bg-secondary/20 cursor-pointer">
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">{m.league}</td>
                        <td className="px-4 py-3 font-medium text-foreground"><TeamBadge name={m.homeTeam} logo={m.homeLogo} /></td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-foreground">{m.homeScore}-{m.awayScore}</td>
                        <td className="px-4 py-3 font-medium text-foreground"><TeamBadge name={m.awayTeam} logo={m.awayLogo} /></td>
                        <td className="px-4 py-3 text-center">{getStatusBadge(m.status, m.minute, m.matchDate)}</td>
                        <td className="px-4 py-3 text-center text-[10px] text-muted-foreground">
                          {market ? market.outcomes.map((outcome) => Number(outcome.price).toFixed(2)).join(" / ") : "—"}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No matches found. Check back during match times.</div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No matches found. Check back during match times.</div>
              )}
              {filtered.map(m => (
                <div key={m.id} onClick={() => navigate(`/match/${m.id}`)} className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-border/80 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">{m.league}</span>
                    {getStatusBadge(m.status, m.minute, m.matchDate)}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate"><TeamBadge name={m.homeTeam} logo={m.homeLogo} size={16} /></div>
                    </div>
                    <div className="text-center shrink-0 px-3">
                      <div className="text-lg font-mono font-bold text-foreground">{m.homeScore} - {m.awayScore}</div>
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm font-semibold text-foreground flex justify-end"><TeamBadge name={m.awayTeam} logo={m.awayLogo} size={16} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LiveMatches;
