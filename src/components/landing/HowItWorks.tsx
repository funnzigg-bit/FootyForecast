import { motion } from "framer-motion";
import { Database, Brain, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Database,
    title: "Data Collection",
    description: "We gather team form, expected goals (xG), shots, defensive stats, home/away records, and head-to-head data from every major league.",
    accent: "primary" as const,
  },
  {
    icon: Brain,
    title: "Model Analysis",
    description: "Our weighted statistical model calculates probabilities for match results, goals markets, BTTS, correct scores, and identifies value picks.",
    accent: "accent" as const,
  },
  {
    icon: BarChart3,
    title: "Prediction Output",
    description: "Results, goals markets, upset alerts, and confidence scores are generated for every fixture. Updated daily with the latest data.",
    accent: "primary" as const,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How <span className="text-primary">FootyForecast</span> Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From raw data to actionable predictions in three simple steps.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="mt-20 hidden lg:block">
          <div className="relative">
            <div className="absolute top-[52px] left-[120px] right-[120px] h-px bg-border" />
            <div className="absolute top-[51px] left-[120px] right-[120px] h-[3px] overflow-hidden">
              <div className="absolute h-full w-8 rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse-line" />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex h-[104px] w-[104px] items-center justify-center">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.accent === "primary" ? "from-primary/30 to-primary/5" : "from-accent/30 to-accent/5"} p-[2px]`}>
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${step.accent === "primary" ? "bg-primary/10" : "bg-accent/10"}`}>
                          <step.icon className={`h-7 w-7 ${step.accent === "primary" ? "text-primary" : "text-accent"}`} />
                        </div>
                      </div>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-[10px] font-mono font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="mt-16 lg:hidden">
          <div className="relative space-y-8">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4 pl-14"
              >
                <div className={`absolute left-2 flex h-9 w-9 items-center justify-center rounded-full border-2 ${step.accent === "primary" ? "border-primary/30 bg-primary/10" : "border-accent/30 bg-accent/10"}`}>
                  <step.icon className={`h-4 w-4 ${step.accent === "primary" ? "text-primary" : "text-accent"}`} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">STEP {i + 1}</span>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
