import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does FootyForecast predict match results?",
    a: "FootyForecast uses a 10-factor weighted statistical model that combines expected goals (xG), defensive xGA, shots on target, recent form, home advantage, head-to-head data, possession efficiency, and conversion rates to calculate match probabilities.",
  },
  {
    q: "What markets do you predict?",
    a: "We generate predictions for match results (home/draw/away), correct scores, over/under 2.5 and 3.5 goals, BTTS (both teams to score), and identify upset picks and value opportunities.",
  },
  {
    q: "Which leagues are covered?",
    a: "FootyForecast currently covers 12+ leagues including the Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, Europa League, and several other major European competitions.",
  },
  {
    q: "Is FootyForecast really free?",
    a: "Yes, FootyForecast is 100% free. All predictions, all leagues, all markets — no paywall, no premium tier. We may introduce optional premium features in the future but the core platform will always remain free.",
  },
  {
    q: "What is the confidence score?",
    a: "The confidence score reflects how strongly our model favours a particular outcome. It's derived from the probability gap between outcomes and model agreement across markets. High (80-100), Medium (60-79), and Low (40-59).",
  },
  {
    q: "How accurate are the predictions?",
    a: "Our model achieves approximately 68% accuracy on match result predictions across all confidence levels. High-confidence predictions perform significantly better. Predictions are informational only and should not be relied upon for financial decisions.",
  },
  {
    q: "How often are predictions updated?",
    a: "Predictions are updated daily as new match data becomes available. Live match predictions update in real time during games.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Can't find what you're looking for? Reach out and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@footyforecast.com"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-lg border border-border bg-card/50 px-4 data-[state=open]:border-primary/20"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
