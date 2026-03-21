import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchImpactStats } from "@/services/firebase";
import { IMPACT_ICONS, DEFAULT_ICON_KEY } from "@/constants/impactIcons";
import type { ImpactMetric } from "@/types/firebase";

/** Fallback metrics shown when the Firestore document has not been created yet. */
const DEFAULT_STATS: ImpactMetric[] = [
  { id: "1", label: "Women Empowered", value: 2500, suffix: "+", iconKey: "users" },
  { id: "2", label: "Workshops Held", value: 85, suffix: "", iconKey: "book-open" },
  { id: "3", label: "Districts Reached", value: 18, suffix: "", iconKey: "map-pin" },
  { id: "4", label: "Job Placements", value: 340, suffix: "+", iconKey: "target" },
];

const CountUp = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const ImpactSection = () => {
  const { data: impactDoc } = useQuery({
    queryKey: ["impact-stats"],
    queryFn: fetchImpactStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const metrics =
    impactDoc?.metrics && impactDoc.metrics.length > 0
      ? impactDoc.metrics
      : DEFAULT_STATS;

  return (
    <section id="impact" className="py-20 md:py-28 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">
            Our Impact
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Numbers That Tell Our Story
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((metric, i) => {
            const iconEntry =
              IMPACT_ICONS[metric.iconKey] ?? IMPACT_ICONS[DEFAULT_ICON_KEY];
            const MetricIcon = iconEntry.Icon;

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-background rounded-xl p-6 md:p-8 text-center shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-14 h-14 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4">
                  <MetricIcon size={26} className="text-primary-foreground" />
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1">
                  <CountUp target={metric.value} suffix={metric.suffix ?? ""} />
                </p>
                <p className="text-muted-foreground text-sm font-medium">
                  {metric.label}
                </p>
              </motion.div>
            );
          })}
        </div>
        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-xl mx-auto bg-background rounded-xl p-6 shadow-card"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Goal for 2026</span>
            <span className="text-sm font-bold text-primary">2,500 / 5,000 Women</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "50%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full gradient-warm rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;
