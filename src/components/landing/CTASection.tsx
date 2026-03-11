import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-12 text-center glow-green"
        >
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="absolute top-8 left-12 h-1 w-1 rounded-full bg-primary/30 animate-float" />
          <div className="absolute top-16 right-16 h-1.5 w-1.5 rounded-full bg-accent/30 animate-float-slow" />
          <div className="absolute bottom-12 left-1/4 h-1 w-1 rounded-full bg-primary/20 animate-float-slower" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Logo size="md" />
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Predict the Weekend?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of football prediction enthusiasts. Start accessing data-driven predictions across every major league today.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/signup">
                <Button size="lg" className="glow-green-sm gap-2 px-8 text-base font-bold">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="gap-2 px-6 text-base">
                  <BarChart3 className="h-4 w-4" /> Explore the Model
                </Button>
              </a>
            </div>
            <span className="mt-4 inline-block text-xs text-muted-foreground">100% free · No credit card required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
