import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEventStore } from "@/stores/eventStore";

const INITIAL_VISIBLE = 4;

const PastEvents = () => {
  const pastEvents = useEventStore((s) => s.events.filter((e) => e.type === "past"));
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!lightbox) return;
      const next = (lightbox.index + dir + lightbox.images.length) % lightbox.images.length;
      setLightbox({ ...lightbox, index: next });
    },
    [lightbox]
  );

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
          <div className="space-y-16">
            {pastEvents.map((event) => {
              const visible = visibleCounts[event.id] || INITIAL_VISIBLE;
              const gallery = event.gallery || [];
              const shownGallery = gallery.slice(0, visible);
              const hasMore = visible < gallery.length;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-2xl overflow-hidden shadow-card"
                >
                  <div className="relative h-64 md:h-80">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-foreground/40" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-accent text-sm font-semibold mb-1">{event.date}</p>
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">{event.title}</h3>
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

                    {event.testimonial && (
                      <div className="bg-card rounded-xl p-5 mb-8 flex gap-4 items-start">
                        <Quote size={28} className="text-primary shrink-0 mt-1" />
                        <div>
                          <p className="text-foreground italic mb-2">"{event.testimonial.quote}"</p>
                          <p className="text-sm font-semibold text-foreground">— {event.testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{event.testimonial.role}</p>
                        </div>
                      </div>
                    )}

                    {shownGallery.length > 0 && (
                      <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {shownGallery.map((img, idx) => (
                            <button key={idx} onClick={() => openLightbox(gallery, idx)} className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                              <img src={img} alt={`${event.title} gallery ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                        {hasMore && (
                          <div className="text-center mt-4">
                            <button
                              onClick={() => setVisibleCounts((prev) => ({ ...prev, [event.id]: visible + 8 }))}
                              className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors min-h-[48px]"
                            >
                              Load More Photos
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4" onClick={closeLightbox}>
            <button className="absolute top-4 right-4 text-primary-foreground p-2" onClick={closeLightbox} aria-label="Close"><X size={28} /></button>
            <button className="absolute left-4 text-primary-foreground p-2" onClick={(e) => { e.stopPropagation(); navigate(-1); }} aria-label="Previous"><ChevronLeft size={36} /></button>
            <img src={lightbox.images[lightbox.index]} alt="Gallery" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 text-primary-foreground p-2" onClick={(e) => { e.stopPropagation(); navigate(1); }} aria-label="Next"><ChevronRight size={36} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PastEvents;
