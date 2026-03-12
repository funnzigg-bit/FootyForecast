import { motion } from "framer-motion";
import { Clock3, Goal, Radar, ShieldCheck, Target } from "lucide-react";
import { usePredictionsData } from "@/hooks/usePredictionsData";

const statCards = [
  { key: "result", label: "1X2 hit rate", icon: Target, tone: "text-primary" },
  { key: "btts", label: "BTTS hit rate", icon: Goal, tone: "text-accent" },
  { key: "over25", label: "O2.5 hit rate", icon: Radar, tone: "text-warning" },
  { key: "coverage", label: "Leagues covered", icon: ShieldCheck, tone: "text-foreground" },
] as const;

const ProofSection = () => {
  const { data: predictions = [], dataUpdatedAt } = usePredictionsData();
  const settled = predictions.filter((prediction) => prediction.status === "finished");
  const trackedFixtures = predictions.length;
  const leaguesCovered = new Set(predictions.map((prediction) => prediction.league)).size;
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const resultHits = settled.filter((prediction) => {
    const actual =
      prediction.homeScore > prediction.awayScore
        ? "Home Win"
        : prediction.homeScore < prediction.awayScore
        ? "Away Win"
        : "Draw";
    return actual === prediction.predictedResult;
  }).length;

  const bttsHits = settled.filter((prediction) => {
    const actual = prediction.homeScore > 0 && prediction.awayScore > 0 ? "Yes" : "No";
    return actual === prediction.bttsResult;
  }).length;

  const over25Hits = settled.filter((prediction) => {
    const actual = prediction.homeScore + prediction.awayScore >= 3;
    return actual === (prediction.over25Prob >= 50);
  }).length;

  const hitRate = (hits: number) =>
    settled.length > 0 ? `${Math.round((hits / settled.length) * 100)}%` : "—";

  const recentSettled = settled
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(left.matchDate ?? 0).getTime();
      const rightTime = new Date(right.matchDate ?? 0).getTime();
      return rightTime - leftTime;
    })
    .slice(0, 4);

  const values = {
    result: hitRate(resultHits),
    btts: hitRate(bttsHits),
    over25: hitRate(over25Hits),
    coverage: String(leaguesCovered),
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[28px] border border-border/80 bg-card/80 p-6 shadow-[0_22px_70px_-46px_rgba(0,0,0,0.85)] backdrop-blur-sm sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="h-3 w-3" />
                Product proof
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Trust the product because the product shows its work.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Current-cycle coverage, recent settled outcomes, and refresh timing are shown directly instead of relying on marketing testimonials or pricing filler.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {statCards.map((card) => (
                  <div key={card.key} className="rounded-2xl border border-border/70 bg-background/65 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      <card.icon className={`h-3.5 w-3.5 ${card.tone}`} />
                      {card.label}
                    </div>
                    <div className={`mt-3 text-3xl font-black font-mono ${card.tone}`}>{values[card.key]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-background/65 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current cycle</div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">What the feed is covering right now</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {updatedAt
                      ? updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Updating"}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tracked fixtures</div>
                    <div className="mt-1 text-xl font-black text-foreground">{trackedFixtures}</div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Settled sample</div>
                    <div className="mt-1 text-xl font-black text-foreground">{settled.length}</div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Refresh cadence</div>
                    <div className="mt-1 text-xl font-black text-foreground">Daily + live</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/65 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent settled fixtures</div>
                <div className="mt-3 space-y-3">
                  {recentSettled.length > 0 ? recentSettled.map((prediction) => {
                    const actual =
                      prediction.homeScore > prediction.awayScore
                        ? "Home Win"
                        : prediction.homeScore < prediction.awayScore
                        ? "Away Win"
                        : "Draw";
                    const hit = actual === prediction.predictedResult;

                    return (
                      <div key={prediction.id} className="grid grid-cols-[1.3fr_80px_90px] items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-3 py-3 text-xs">
                        <div>
                          <div className="font-semibold text-foreground">{prediction.homeTeam} vs {prediction.awayTeam}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{prediction.league}</div>
                        </div>
                        <div className="text-center font-mono font-bold text-foreground">
                          {prediction.homeScore}-{prediction.awayScore}
                        </div>
                        <div className={`text-right font-semibold ${hit ? "text-primary" : "text-muted-foreground"}`}>
                          {hit ? "1X2 hit" : prediction.predictedResult}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="rounded-xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground">
                      Settled proof will appear here once finished fixtures are available in the current feed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofSection;
