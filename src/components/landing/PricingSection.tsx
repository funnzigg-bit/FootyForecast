import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "All match predictions",
  "All leagues covered",
  "Daily curated picks",
  "Upset detection",
  "Goals market analysis",
  "Confidence scoring",
  "Full methodology transparency",
  "Live match updates",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            100% Free. No Catch.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            FootyForecast is completely free to use. Access every prediction, every market, every league.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 mx-auto max-w-lg"
        >
          <div className="relative rounded-xl border-2 border-primary/40 bg-card p-8 glow-green">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
              <span className="relative z-10">COMPLETELY FREE</span>
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  backgroundImage: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.2) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">Full Access</h3>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-foreground">$0</span>
                <span className="text-sm text-muted-foreground">forever</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Every feature, every league, no limits.</p>
            </div>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/signup">
              <Button className="mt-8 w-full glow-green-sm font-semibold" size="lg">
                <Zap className="mr-2 h-4 w-4" /> Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
