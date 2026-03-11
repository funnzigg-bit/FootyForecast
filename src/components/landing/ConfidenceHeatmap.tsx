import { motion } from "framer-motion";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import TeamBadge from "@/components/TeamBadge";
import { getMarketLabel, isPredictionToday, isUpcomingPrediction, rankPredictions, uniquePredictionsByFixture } from "@/lib/predictionInsights";

const getConfDot = (conf: number) => {
  if (conf >= 80) return "bg-primary";
  if (conf >= 60) return "bg-warning";
  return "bg-destructive";
};

const ConfidenceHeatmap = () => {
  const { data: allPredictions = [], isLoading } = usePredictionsData();
  const upcoming = uniquePredictionsByFixture(
    rankPredictions(allPredictions.filter((prediction) => isUpcomingPrediction(prediction)))
  );
  const todaysPredictions = upcoming.filter((prediction) => isPredictionToday(prediction));
  const predictions = (todaysPredictions.length > 0 ? todaysPredictions : upcoming).slice(0, 6);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prediction <span className="text-primary">Confidence Heatmap</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Scan predictions at a glance. Green means high confidence, yellow medium, red risky.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-xl border border-border bg-card overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No predictions available right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground text-xs">
                    <th className="px-4 py-3 text-left font-medium">Match</th>
                    <th className="px-4 py-3 text-center font-medium">Prediction</th>
                    <th className="px-4 py-3 text-center font-medium">Confidence</th>
                    <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">BTTS</th>
                    <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">O2.5</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, i) => (
                    <tr key={p.id} className={`border-b border-border/20 transition-colors hover:bg-secondary/20 ${i >= 3 ? 'opacity-40 blur-[2px] select-none' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="text-[10px] text-muted-foreground">{p.league}</div>
                        <div className="font-medium text-foreground flex items-center gap-1 flex-wrap"><TeamBadge name={p.homeTeam} logo={p.homeLogo} size={16} /> <span className="text-muted-foreground">vs</span> <TeamBadge name={p.awayTeam} logo={p.awayLogo} size={16} /></div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-foreground">{getMarketLabel(p)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className={`h-2 w-2 rounded-full ${getConfDot(p.confidence)}`} />
                          <span className={`font-mono font-bold ${p.confidence >= 80 ? 'text-primary' : p.confidence >= 60 ? 'text-warning' : 'text-destructive'}`}>
                            {p.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`text-xs font-medium ${p.bttsResult === 'Yes' ? 'text-primary' : 'text-muted-foreground'}`}>
                          {p.bttsResult}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell font-mono text-muted-foreground">
                        {p.over25Prob}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="relative flex items-center justify-center py-6 border-t border-border/30">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                <Lock className="h-4 w-4" />
                Sign up free to see all predictions
              </div>
              <Link to="/signup">
                <Button size="sm" className="glow-green-sm font-semibold gap-2">
                  View All Predictions <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> High (80%+)</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-warning" /> Medium (60-79%)</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-destructive" /> Low (&lt;60%)</div>
        </div>
      </div>
    </section>
  );
};

export default ConfidenceHeatmap;
