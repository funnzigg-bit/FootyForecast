import { motion, useInView } from "framer-motion";
import { Target, TrendingUp, BarChart3, Gauge, Globe, Shield } from "lucide-react";
import { useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/useCountUp";

const ProbabilityBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const score = useCountUp(82);

  return (
    <div ref={ref} className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Win probability</span>
        <span className="font-mono font-bold text-primary" ref={score.ref}>{score.count}%</span>
      </div>
      <Progress
        value={isInView ? 82 : 0}
        className="h-2 bg-muted"
        indicatorClassName="bg-gradient-to-r from-primary to-accent"
        indicatorStyle={{ transitionDuration: "2000ms" }}
      />
      <div className="flex gap-1">
        {["xG ↑", "Form", "Home edge"].map((s) => (
          <span key={s} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
};

const MarketPreview = () => (
  <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-3 text-xs space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">Arsenal vs Brighton</span>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">High</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
      <div>O2.5: 58%</div>
      <div>BTTS: No</div>
      <div>Score: 2-0</div>
    </div>
  </div>
);

const features = [
  {
    icon: Gauge,
    title: "10-Factor Prediction Model",
    description: "Combines xG, xGA, shots on target, form, home advantage, head-to-head, possession efficiency, and conversion rate into precise probabilities.",
    size: "large" as const,
    extra: "probability",
  },
  {
    icon: BarChart3,
    title: "Multi-Market Predictions",
    description: "Get probabilities for match results, correct scores, over/under goals, BTTS, and value picks — all from one model.",
    size: "large" as const,
    extra: "market",
  },
  {
    icon: TrendingUp,
    title: "Upset Detection",
    description: "Identifies potential surprise results where underdogs have strong underlying data indicators.",
    size: "small" as const,
  },
  {
    icon: Globe,
    title: "11 Leagues Covered",
    description: "From England's top four tiers to Europe's elite competitions. Every league analysed with equal depth.",
    size: "small" as const,
  },
  {
    icon: Target,
    title: "Confidence Scoring",
    description: "Every prediction includes a confidence band: High, Medium, or Low — based on probability gaps and model agreement.",
    size: "small" as const,
  },
  {
    icon: Shield,
    title: "Transparent Methodology",
    description: "We show our working. Every prediction comes with factor breakdowns and reasoning.",
    size: "small" as const,
  },
];

const FeaturesSection = () => {
  return (
    <section id="predictions" className="relative py-24 bg-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for <span className="text-accent text-glow-cyan">Smarter</span> Football Predictions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every feature is designed to give you a data-driven edge across multiple markets.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const isLarge = f.size === "large";
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 ${
                  isLarge ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                }`}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className={`font-semibold text-foreground ${isLarge ? "text-lg" : "text-sm"}`}>{f.title}</h3>
                <p className={`mt-2 leading-relaxed text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>{f.description}</p>
                {f.extra === "probability" && <ProbabilityBar />}
                {f.extra === "market" && <MarketPreview />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
