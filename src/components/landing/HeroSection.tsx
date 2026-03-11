import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BarChart3, Clock3, Radio, ShieldCheck, TrendingUp, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountUp } from "@/hooks/useCountUp";
import { useRef } from "react";
import DashboardPreview from "./DashboardPreview";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { useLiveMatches } from "@/hooks/useLiveMatches";

const floatingBadges = [
  {
    text: "⚡ Arsenal 82% — Home Win",
    position: "top-8 -left-4 lg:top-16 lg:-left-12",
    delay: 0,
    animation: "animate-float",
  },
  {
    text: "🔥 Over 2.5 Goals — 78%",
    position: "top-1/3 -right-2 lg:-right-8",
    delay: 1.5,
    animation: "animate-float-slow",
  },
  {
    text: "🎯 BTTS Yes — 72%",
    position: "bottom-12 -left-2 lg:bottom-16 lg:-left-6",
    delay: 3,
    animation: "animate-float-slower",
  },
];

const HeroSection = () => {
  const { data: predictionsData = [], dataUpdatedAt } = usePredictionsData();
  const { data: liveMatches = [] } = useLiveMatches(60000);
  const accuracy = useCountUp(68);
  const predictions = useCountUp(Math.max(predictionsData.length, 1247));
  const leagues = useCountUp(Math.max(new Set(predictionsData.map((prediction) => prediction.league)).size, 12));
  const liveCount = liveMatches.filter((match) => match.status === "live").length;
  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden pt-16">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        style={{ scale: orbScale, opacity: orbOpacity }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]"
      />
      <motion.div
        style={{ scale: orbScale, opacity: orbOpacity }}
        className="absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center pt-20 pb-16 text-center lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <BarChart3 className="h-3 w-3" />
            100% Free Football Prediction Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Predict the Weekend{" "}
            <span className="text-primary text-glow-green">Before It Happens</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Data-driven football predictions for results, goals, BTTS and value picks across the world's biggest leagues.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link to="/signup">
              <Button size="lg" className="glow-green gap-2 px-8 text-base font-bold">
                View Today's Predictions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-border px-8 text-base"
              >
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
            <div className="rounded-2xl border border-border bg-card/55 p-4 text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Radio className="h-3.5 w-3.5" />
                Live Pulse
              </div>
              <p className="mt-2 text-sm text-foreground">{liveCount} matches live right now</p>
              <p className="mt-1 text-xs text-muted-foreground">Live score, momentum, and match-state shifts update the dashboard view.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/55 p-4 text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                Model Scope
              </div>
              <p className="mt-2 text-sm text-foreground">{predictionsData.length || 0} tracked fixtures across major leagues</p>
              <p className="mt-1 text-xs text-muted-foreground">1X2, BTTS, totals, top scorelines, and ranked daily angles in one view.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/55 p-4 text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-warning">
                <Clock3 className="h-3.5 w-3.5" />
                Freshness
              </div>
              <p className="mt-2 text-sm text-foreground">
                {updatedAt ? `Predictions refreshed ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Predictions refresh throughout the day"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Use the dashboard for live state; pre-match confidence is clearly separated from in-game swings.</p>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm sm:gap-16 sm:px-12"
          >
            <div className="text-center" ref={accuracy.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary sm:text-3xl">
                <TrendingUp className="h-5 w-5" /> {accuracy.count}%
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Prediction Accuracy
              </div>
            </div>
            <div className="text-center" ref={predictions.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent sm:text-3xl">
                <Zap className="h-5 w-5" /> {predictions.count >= 1000 ? `${(predictions.count / 1000).toFixed(1)}k` : predictions.count}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Matches Predicted
              </div>
            </div>
            <div className="text-center" ref={leagues.ref}>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground sm:text-3xl">
                <Target className="h-5 w-5" /> {leagues.count}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Leagues Covered
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview with floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mt-16 w-full hidden md:block"
          >
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + badge.delay * 0.3 }}
                className={`absolute z-10 ${badge.position} ${badge.animation}`}
                style={{ animationDelay: `${badge.delay}s` }}
              >
                <div className="rounded-lg border border-primary/20 bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg shadow-primary/5 backdrop-blur-sm">
                  {badge.text}
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
