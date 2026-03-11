import { motion } from "framer-motion";
import { LEAGUES } from "@/services/leagues";

const row1 = LEAGUES.slice(0, 4);
const row2 = LEAGUES.slice(4);

const MarqueeRow = ({ items, reverse = false }: { items: typeof LEAGUES; reverse?: boolean }) => (
  <div className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
    <div className={`flex shrink-0 gap-3 py-2 ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover:[animation-play-state:paused]`}>
      {[...items, ...items].map((league, i) => (
        <div
          key={`${league.name}-${i}`}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <span>{league.flag}</span>
          {league.name}
        </div>
      ))}
    </div>
  </div>
);

const LeaguesSection = () => {
  return (
    <section id="leagues" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <span className="text-primary">7</span> Leagues. Global Coverage.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Europe's top leagues and elite competitions. FootyForecast covers them all with equal analytical depth.
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          <MarqueeRow items={row1} />
          <MarqueeRow items={row2} reverse />
        </div>
      </div>
    </section>
  );
};

export default LeaguesSection;
