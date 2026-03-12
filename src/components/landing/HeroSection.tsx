import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Clock3, Radio, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import DashboardPreview from "./DashboardPreview";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { useLiveMatches } from "@/hooks/useLiveMatches";

const floatingBadges = [
  {
    label: "Live angle",
    text: "Arsenal vs Brighton",
    value: "Home Win 82%",
    position: "top-8 -left-4 lg:top-16 lg:-left-12",
    delay: 0,
    animation: "animate-float",
  },
  {
    label: "Goals market",
    text: "Barcelona vs Valencia",
    value: "Over 2.5 78%",
    position: "top-1/3 -right-2 lg:-right-8",
    delay: 1.5,
    animation: "animate-float-slow",
  },
  {
    label: "BTTS read",
    text: "Real Madrid vs PSG",
    value: "BTTS Yes 72%",
    position: "bottom-12 -left-2 lg:bottom-16 lg:-left-6",
    delay: 3,
    animation: "animate-float-slower",
  },
];

const pillClassName =
  "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm";

const HeroSection = () => {
  const { data: predictionsData = [], dataUpdatedAt } = usePredictionsData();
  const { data: liveMatches = [] } = useLiveMatches(60000);
  const liveCount = liveMatches.filter((match) => match.status === "live").length;
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const trackedToday = predictionsData.filter((prediction) => {
    if (!prediction.matchDate) return false;
    const date = new Date(prediction.matchDate);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  }).length;
  const marketsCovered = ["1X2", "BTTS", "Over/Under", "Correct Score"];
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden pt-16">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-grid opacity-20" />
      <motion.div
        style={{ scale: orbScale, opacity: orbOpacity }}
        className="absolute left-1/2 top-1/4 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]"
      />
      <motion.div
        style={{ scale: orbScale, opacity: orbOpacity }}
        className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pb-16 pt-20 text-center lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${pillClassName} mb-5 text-primary`}
          >
            <BarChart3 className="h-3 w-3" />
            Football prediction console
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-5xl text-4xl font-black tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Match probabilities, live swings, and daily picks presented like a proper football desk.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            FootyForecast combines pre-match model reads and live match-state shifts across results, goals, BTTS, and ranked picks, with freshness and market context visible at a glance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center"
          >
            <Link to="/signup">
              <Button size="lg" className="min-w-[240px] gap-2 px-8 text-base font-bold">
                View Today's Predictions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full gap-2 border-border bg-background/65 px-6 text-base sm:w-auto">
                <BarChart3 className="h-4 w-4" /> Explore the Model
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-8 grid w-full max-w-5xl gap-3 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-border/80 bg-card/75 p-4 text-left shadow-[0_10px_40px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Radio className="h-3.5 w-3.5" />
                Live Pulse
              </div>
              <p className="mt-2 text-sm text-foreground">{liveCount} matches live right now</p>
              <p className="mt-1 text-xs text-muted-foreground">Live score, momentum, and match-state shifts update the dashboard view.</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/75 p-4 text-left shadow-[0_10px_40px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                Proof Strip
              </div>
              <p className="mt-2 text-sm text-foreground">{trackedToday || predictionsData.length || 0} fixtures highlighted in the current cycle</p>
              <p className="mt-1 text-xs text-muted-foreground">{marketsCovered.join(" · ")} with ranked daily picks and live-state separation.</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/75 p-4 text-left shadow-[0_10px_40px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
                <Clock3 className="h-3.5 w-3.5" />
                Freshness
              </div>
              <p className="mt-2 text-sm text-foreground">
                {updatedAt ? `Predictions refreshed ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Predictions refresh throughout the day"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Use the dashboard for live state; pre-match confidence is clearly separated from in-game swings.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 grid w-full max-w-5xl gap-3 rounded-2xl border border-border/80 bg-background/80 p-4 text-left backdrop-blur-sm sm:grid-cols-[1.4fr_1fr_1fr]"
          >
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Methodology note</div>
              <div className="mt-2 text-sm font-semibold text-foreground">Pre-match confidence and live probabilities are intentionally separate products.</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                Ranked picks are set from the pre-match model. Live views then respond to scoreline, minute, pressure, and incidents instead of pretending the pre-match edge never changed.
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Markets</div>
              <div className="mt-2 text-xl font-black text-foreground">{marketsCovered.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">Core angles presented consistently across landing, dashboard, and match detail.</div>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">Coverage</div>
              <div className="mt-2 text-xl font-black text-foreground">{predictionsData.length || 0}</div>
              <div className="mt-1 text-xs text-muted-foreground">Fixtures currently available in the prediction feed across major football leagues.</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.46 }}
            className="mt-6 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2"
          >
            {marketsCovered.map((market) => (
              <div
                key={market}
                className="rounded-full border border-border/70 bg-card/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {market}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mt-16 hidden w-full md:block"
          >
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + badge.delay * 0.3 }}
                className={`absolute z-10 ${badge.position} ${badge.animation}`}
                style={{ animationDelay: `${badge.delay}s` }}
              >
                <div className="rounded-xl border border-border/80 bg-background/88 px-3 py-2 text-left shadow-xl backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{badge.label}</div>
                  <div className="mt-1 text-xs font-semibold text-foreground">{badge.text}</div>
                  <div className="text-[11px] text-muted-foreground">{badge.value}</div>
                </div>
              </motion.div>
            ))}
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
