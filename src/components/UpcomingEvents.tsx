import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, Share2 } from "lucide-react";
import { format } from "date-fns";
import { useEventStore } from "@/stores/eventStore";
import { EventStatus, type Event } from "@/types/firebase";

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
    navigator.share({ title: event.title, text, url: window.location.href });
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`,
      "_blank"
    );
  }
};

const UpcomingEvents = () => {
  const allEvents = useEventStore((s) => s.events);
  const events = useMemo(
    () => allEvents.filter((e) => e.status !== EventStatus.COMPLETED),
    [allEvents]
  );

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => {
              const status = statusConfig[event.status];
              const isClosed = event.status === EventStatus.REGISTRATION_CLOSED;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow flex flex-col"
                >
                  {event.coverImageUrl && (
                    <div className="relative">
                      <img src={event.coverImageUrl} alt={event.title} className="w-full h-48 object-cover" loading="lazy" />
                      {status && (
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                          {status.label}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">{event.title}</h3>
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
                          <a href={event.venueUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
                            {event.venueName}
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 flex-1">{event.description}</p>
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
                        onClick={(e) => isClosed && e.preventDefault()}
                      >
                        <ExternalLink size={16} />
                        {isClosed ? "Closed" : "Register"}
                      </a>
                      <button
                        onClick={() => handleShare(event)}
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
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvents;
