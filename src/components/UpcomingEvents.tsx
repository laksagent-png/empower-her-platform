import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fetchUpcomingEventsPage } from "@/services/firebase";
import { EventStatus, type Event } from "@/types/firebase";

const PAGE_SIZE = 10;

const statusConfig: Record<EventStatus, { label: string; className: string } | undefined> = {
  [EventStatus.FILLING_FAST]: { label: "Filling Fast", className: "bg-accent text-accent-foreground" },
  [EventStatus.REGISTRATION_CLOSED]: { label: "Registration Closed", className: "bg-muted text-muted-foreground" },
  [EventStatus.ONLINE]: { label: "Online", className: "bg-secondary text-secondary-foreground" },
  [EventStatus.COMPLETED]: undefined,
};

const handleShare = (e: React.MouseEvent, event: Event) => {
  e.preventDefault();
  e.stopPropagation();
  const dateStr = format(new Date(event.startDateTime), "dd MMM yyyy");
  const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/events/${event.id}`;
  const text = `Join me at "${event.title}" by Aagaj on ${dateStr}! Register here:`;
  if (navigator.share) {
    navigator.share({ title: event.title, text, url });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  }
};

const UpcomingEvents = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["events", "upcoming", "pages"],
    queryFn: ({ pageParam }) =>
      fetchUpcomingEventsPage(PAGE_SIZE, pageParam as string | undefined),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.lastId ?? undefined) : undefined,
    initialPageParam: undefined as string | undefined,
  });

  const events = useMemo(
    () =>
      (data?.pages ?? [])
        .flatMap((p) => p.events)
        .filter((e) => e.status !== EventStatus.COMPLETED),
    [data]
  );

  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, events.length]);

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id="events" className="py-20 md:py-28 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">
            Upcoming Events
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Join Our Next Workshop
          </h2>
        </motion.div>

        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
        ) : (
          <>
            <div className="relative">
              {/* Left arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll(-1)}
                  className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-card-hover flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Scroll container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              >
                {events.map((event, i) => {
                  const status = statusConfig[event.status];
                  const isClosed = event.status === EventStatus.REGISTRATION_CLOSED;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i, 3) * 0.1 }}
                      className="min-w-[300px] max-w-[340px] shrink-0 bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow flex flex-col cursor-pointer"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      {event.coverImage && (
                        <div className="relative">
                          <img src={event.coverImage.url} alt={event.title} className="w-full h-48 object-cover" loading="lazy" />
                          {status && (
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                              {status.label}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-heading text-xl font-bold text-foreground mb-2 hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-1.5 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} /> {format(new Date(event.startDateTime), "dd MMM yyyy")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {format(new Date(event.startDateTime), "h:mm a")} – {format(new Date(event.endDateTime), "h:mm a")}
                          </div>
                          {event.venueName && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span
                                onClick={(e) => { e.stopPropagation(); window.open(event.venueUrl, "_blank"); }}
                                className="underline hover:text-primary transition-colors cursor-pointer"
                              >
                                {event.venueName}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-5 flex-1 line-clamp-3">{event.description}</p>
                        <div className="flex gap-3 mt-auto">
                          <a
                            href={isClosed ? undefined : event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold min-h-[48px] transition-opacity ${
                              isClosed
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "gradient-warm text-primary-foreground hover:opacity-90"
                            }`}
                            onClick={(e) => { e.stopPropagation(); if (isClosed) e.preventDefault(); }}
                          >
                            <ExternalLink size={16} />
                            {isClosed ? "Closed" : "Register"}
                          </a>
                          <button
                            onClick={(ev) => handleShare(ev, event)}
                            className="p-3 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors min-h-[48px]"
                            aria-label="Share event"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {hasNextPage && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`min-w-[300px] max-w-[340px] shrink-0 bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 min-h-[320px] ${
                      isFetchingNextPage ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => { if (!isFetchingNextPage) fetchNextPage(); }}
                    role="button"
                    aria-disabled={isFetchingNextPage}
                    tabIndex={0}
                    onKeyDown={(e) => { if (!isFetchingNextPage && (e.key === "Enter" || e.key === " ")) fetchNextPage(); }}
                  >
                    <div className="p-10 flex flex-col items-center gap-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <ChevronRight size={28} className="text-primary" />
                      </div>
                      <p className="font-heading text-lg font-bold text-foreground">
                        {isFetchingNextPage ? "Loading…" : "Load More"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scroll(1)}
                  className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card shadow-card-hover flex items-center justify-center text-foreground hover:text-primary transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvents;

