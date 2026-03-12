import { motion, useInView } from "framer-motion";
import { Target, TrendingUp, BarChart3, Gauge, Globe, Shield, Clock3, Radio } from "lucide-react";
import { useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/useCountUp";

const labelClassName =
  "inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";

const ProbabilityBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const score = useCountUp(82);

  return (
    <div ref={ref} className="mt-5 space-y-2">
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
        {["xG ↑", "Form", "Home edge"].map((signal) => (
          <span key={signal} className="rounded-full border border-primary/15 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {signal}
          </span>
        ))}
      </div>
    </div>
  );
};

const MarketPreview = () => (
  <div className="mt-5 rounded-xl border border-border/60 bg-background/70 p-3 text-xs space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">Arsenal vs Brighton</span>
      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">High</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
      <div>O2.5: 58%</div>
      <div>BTTS: No</div>
      <div>Score: 2-0</div>
    </div>
  </div>
);

const ConfidenceRail = () => (
  <div className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-4">
    <div className="flex items-center justify-between">
      <span className={labelClassName}>
        <Target className="h-3 w-3" />
        Daily ranking
      </span>
      <span className="text-[11px] text-muted-foreground">Sorted by conviction</span>
    </div>
    <div className="mt-4 space-y-3">
      {[
        { match: "Inter vs Atalanta", market: "Home Win", confidence: 78 },
        { match: "Chelsea vs Newcastle", market: "BTTS Yes", confidence: 71 },
        { match: "Atletico vs Getafe", market: "Under 2.5", confidence: 64 },
      ].map((item) => (
        <div key={item.match} className="grid grid-cols-[1.4fr_0.8fr_56px] items-center gap-3 text-xs">
          <div>
            <div className="font-semibold text-foreground">{item.match}</div>
            <div className="text-[11px] text-muted-foreground">{item.market}</div>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${item.confidence}%` }} />
          </div>
          <div className="text-right font-mono font-bold text-foreground">{item.confidence}%</div>
        </div>
      ))}
    </div>
  </div>
);

const LiveSwingCard = () => (
  <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
    <div className="flex items-center justify-between">
      <span className={labelClassName}>
        <Radio className="h-3 w-3" />
        Live swing
      </span>
      <span className="text-[11px] text-muted-foreground">58&apos;</span>
    </div>
    <div className="mt-4 text-sm font-semibold text-foreground">Liverpool vs Spurs</div>
    <div className="mt-1 text-xs text-muted-foreground">The in-play view now leans heavily to the leading side after a two-goal swing and rising pressure.</div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      {[
        { label: "Home", value: "74%" },
        { label: "Draw", value: "17%" },
        { label: "Away", value: "9%" },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-border/50 bg-background/65 p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
          <div className="mt-1 font-mono font-bold text-foreground">{item.value}</div>
        </div>
      ))}
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
    description: "Get probabilities for match results, correct scores, over/under goals, BTTS, and value picks from one shared model surface.",
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
    description: "From England's top four tiers to Europe's elite competitions. Every league is analyzed with equal depth.",
    size: "small" as const,
  },
  {
    icon: Target,
    title: "Confidence Scoring",
    description: "Every prediction includes a confidence band based on probability gaps and model agreement.",
    size: "small" as const,
  },
  {
    icon: Shield,
    title: "Transparent Methodology",
    description: "Every prediction comes with factor breakdowns and readable reasoning instead of opaque confidence labels.",
    size: "small" as const,
  },
];

const FeaturesSection = () => {
  const anchorFeatures = features.filter((feature) => feature.size === "large");
  const supportFeatures = features.filter((feature) => feature.size !== "large");

  return (
    <section id="predictions" className="relative bg-dots py-24">
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

        <div className="mt-16 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {anchorFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-border/80 bg-card/75 p-6 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm"
              >
                <span className={labelClassName}>
                  <feature.icon className="h-3 w-3" />
                  {feature.extra === "probability" ? "Model readout" : "Market layer"}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground">{feature.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{feature.description}</p>
                {feature.extra === "probability" && <ProbabilityBar />}
                {feature.extra === "market" && <MarketPreview />}
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-border/80 bg-card/75 p-6 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm"
            >
              <span className={labelClassName}>
                <Clock3 className="h-3 w-3" />
                Editorial proof
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">A believable product readout beats a generic feature card.</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">The model surfaces the strongest market, the confidence gap, and the live movement instead of relying on decorative filler metrics.</p>
              <ConfidenceRail />
            </motion.div>
            <LiveSwingCard />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {supportFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border/70 bg-card/65 p-5 backdrop-blur-sm"
            >
              <span className={labelClassName}>
                <feature.icon className="h-3 w-3" />
                Feature
              </span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
