import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Quote, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { fetchPastEvents } from "@/services/firebase";

const PAGE_SIZE = 5;

const PastEvents = () => {
  const { data: pastEvents = [] } = useQuery({
    queryKey: ["events", "past"],
    queryFn: fetchPastEvents,
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shownEvents = pastEvents.slice(0, visibleCount);
  const hasMore = visibleCount < pastEvents.length;

  return (
    <section id="past-events" className="py-20 md:py-28 bg-card">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">Past Events</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">What We've Achieved</h2>
        </motion.div>

        {pastEvents.length === 0 ? (
          <p className="text-center text-muted-foreground">No past events yet.</p>
        ) : (
          <>
            <div className="space-y-16">
              {shownEvents.map((event) => {
                const gallery = event.images ?? [];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-background rounded-2xl overflow-hidden shadow-card"
                  >
                    <div className="relative h-64 md:h-80">
                      <img src={event.coverImageUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-foreground/40" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-accent text-sm font-semibold mb-1">
                          {format(new Date(event.startDateTime), "MMMM yyyy")}
                        </p>
                        <Link to={`/events/${event.id}`} className="hover:underline">
                          <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">{event.title}</h3>
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      {event.metrics && event.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          {event.metrics.map((m) => (
                            <div key={m.label} className="text-center">
                              <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{m.value}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">{m.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {event.testimonials && event.testimonials.length > 0 && (
                        <div className="bg-card rounded-xl p-5 mb-8 flex gap-4 items-start">
                          <Quote size={28} className="text-primary shrink-0 mt-1" />
                          <div>
                            <p className="text-foreground italic mb-2">"{event.testimonials[0].description}"</p>
                            <p className="text-sm font-semibold text-foreground">— {event.testimonials[0].username}</p>
                          </div>
                        </div>
                      )}

                      {gallery.length > 0 && (
                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline transition-colors"
                        >
                          <ImageIcon size={16} />
                          View Gallery ({gallery.length} photos) →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors min-h-[48px]"
                >
                  Load More Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PastEvents;
