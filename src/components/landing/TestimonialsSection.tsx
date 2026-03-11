import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "FootyForecast picked 4 out of 5 weekend results correctly. The confidence scoring really helps me focus on the strongest predictions.",
    name: "Marcus R.",
    role: "Football Analyst, London",
    stars: 5,
  },
  {
    quote: "The goals market analysis is outstanding. I've been tracking their over 2.5 picks and the hit rate is genuinely impressive. Best free prediction tool I've used.",
    name: "Sofia L.",
    role: "Sports Data Enthusiast, Barcelona",
    stars: 5,
    featured: true,
  },
  {
    quote: "The upset watch section is brilliant. Caught the Nottingham Forest win against Chelsea and the reasoning was spot on. Data-driven and transparent.",
    name: "James K.",
    role: "Football Fan, Melbourne",
    stars: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Football Prediction Enthusiasts
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:items-center">
          {testimonials.map((t, i) => {
            const isFeatured = t.featured;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative rounded-xl p-6 transition-all ${
                  isFeatured
                    ? "border-2 border-primary/30 bg-card shadow-xl shadow-primary/5 md:-mt-6 md:p-8"
                    : "border border-border bg-card/50 md:mt-4"
                }`}
              >
                <Quote className={`mb-3 h-6 w-6 ${isFeatured ? "text-primary/30" : "text-border"}`} />
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`h-3.5 w-3.5 ${si < t.stars ? "fill-warning text-warning" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className={`leading-relaxed text-muted-foreground italic ${isFeatured ? "text-base" : "text-sm"}`}>
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    isFeatured ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"
                  }`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
