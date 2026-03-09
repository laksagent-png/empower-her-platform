import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import eventEntrepreneur from "@/assets/event-entrepreneur.jpg";
import eventHealth from "@/assets/event-health.jpg";
import eventDigital from "@/assets/event-digital.jpg";
import eventSelfDefense from "@/assets/event-selfdefense.jpg";
import eventFinance from "@/assets/event-finance.jpg";

interface PastEvent {
  id: string;
  title: string;
  date: string;
  heroImage: string;
  metrics: { label: string; value: string }[];
  testimonial: { quote: string; name: string; role: string };
  gallery: string[];
}

const pastEvents: PastEvent[] = [
  {
    id: "p1",
    title: "Entrepreneurship Bootcamp 2025",
    date: "November 2025",
    heroImage: eventEntrepreneur,
    metrics: [
      { label: "Women Trained", value: "120" },
      { label: "Businesses Launched", value: "28" },
      { label: "Districts", value: "6" },
    ],
    testimonial: {
      quote: "This workshop changed my life. I started my own handicraft business and now support my entire family.",
      name: "Sunita Devi",
      role: "Participant, Patna",
    },
    gallery: [eventEntrepreneur, eventHealth, eventDigital, eventSelfDefense, eventFinance, eventEntrepreneur],
  },
  {
    id: "p2",
    title: "Women's Health Awareness Camp",
    date: "September 2025",
    heroImage: eventHealth,
    metrics: [
      { label: "Women Reached", value: "350" },
      { label: "Free Checkups", value: "200" },
      { label: "Villages Covered", value: "12" },
    ],
    testimonial: {
      quote: "For the first time, I understood the importance of regular health checkups. Thank you, Aagaj!",
      name: "Meena Kumari",
      role: "Participant, Lucknow",
    },
    gallery: [eventHealth, eventFinance, eventSelfDefense, eventDigital, eventEntrepreneur, eventHealth],
  },
];

const INITIAL_VISIBLE = 4;

const PastEvents = () => {
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
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">
            Past Events
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            What We've Achieved
          </h2>
        </motion.div>

        <div className="space-y-16">
          {pastEvents.map((event) => {
            const visible = visibleCounts[event.id] || INITIAL_VISIBLE;
            const shownGallery = event.gallery.slice(0, visible);
            const hasMore = visible < event.gallery.length;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl overflow-hidden shadow-card"
              >
                {/* Hero */}
                <div className="relative h-64 md:h-80">
                  <img
                    src={event.heroImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/40" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-accent text-sm font-semibold mb-1">{event.date}</p>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {event.metrics.map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="font-heading text-2xl md:text-3xl font-bold text-primary">
                          {m.value}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial */}
                  <div className="bg-card rounded-xl p-5 mb-8 flex gap-4 items-start">
                    <Quote size={28} className="text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-foreground italic mb-2">"{event.testimonial.quote}"</p>
                      <p className="text-sm font-semibold text-foreground">
                        — {event.testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{event.testimonial.role}</p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {shownGallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => openLightbox(event.gallery, idx)}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={img}
                          alt={`${event.title} gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="text-center mt-4">
                      <button
                        onClick={() =>
                          setVisibleCounts((prev) => ({
                            ...prev,
                            [event.id]: visible + 8,
                          }))
                        }
                        className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors min-h-[48px]"
                      >
                        Load More Photos
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-primary-foreground p-2"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-4 text-primary-foreground p-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(-1);
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={36} />
            </button>
            <img
              src={lightbox.images[lightbox.index]}
              alt="Gallery"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 text-primary-foreground p-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(1);
              }}
              aria-label="Next"
            >
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PastEvents;
