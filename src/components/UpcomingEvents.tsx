import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, Share2 } from "lucide-react";
import eventDigital from "@/assets/event-digital.jpg";
import eventSelfDefense from "@/assets/event-selfdefense.jpg";
import eventFinance from "@/assets/event-finance.jpg";

type EventStatus = "filling-fast" | "registration-closed" | "online";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  venueLink: string;
  description: string;
  status: EventStatus;
  formLink: string;
  image: string;
}

const events: EventData[] = [
  {
    id: "1",
    title: "Digital Literacy Workshop",
    date: "15th April 2026",
    time: "10:00 AM – 4:00 PM",
    venue: "Community Hall, Sector 12, Jaipur",
    venueLink: "https://maps.google.com/?q=Community+Hall+Sector+12+Jaipur",
    description:
      "Learn essential computer skills, internet safety, and how to use digital payment platforms. Perfect for women looking to enter the digital workforce.",
    status: "filling-fast",
    formLink: "https://forms.google.com",
    image: eventDigital,
  },
  {
    id: "2",
    title: "Self-Defence Training Camp",
    date: "22nd April 2026",
    time: "7:00 AM – 11:00 AM",
    venue: "Rajiv Gandhi Stadium, Lucknow",
    venueLink: "https://maps.google.com/?q=Rajiv+Gandhi+Stadium+Lucknow",
    description:
      "A hands-on self-defence camp for women of all ages. Build confidence, learn practical techniques, and connect with a supportive community.",
    status: "online",
    formLink: "https://forms.google.com",
    image: eventSelfDefense,
  },
  {
    id: "3",
    title: "Financial Independence Seminar",
    date: "5th May 2026",
    time: "11:00 AM – 3:00 PM",
    venue: "Town Hall, Patna",
    venueLink: "https://maps.google.com/?q=Town+Hall+Patna",
    description:
      "Understand savings, investments, and government schemes designed for women. Take control of your financial future.",
    status: "registration-closed",
    formLink: "https://forms.google.com",
    image: eventFinance,
  },
];

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  "filling-fast": { label: "Filling Fast", className: "bg-accent text-accent-foreground" },
  "registration-closed": { label: "Registration Closed", className: "bg-muted text-muted-foreground" },
  online: { label: "Online", className: "bg-secondary text-secondary-foreground" },
};

const handleShare = (event: EventData) => {
  const text = `Join me at "${event.title}" by Aagaj on ${event.date}! Register here:`;
  if (navigator.share) {
    navigator.share({ title: event.title, text, url: window.location.href });
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`,
      "_blank"
    );
  }
};

const UpcomingEvents = () => {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, i) => {
            const status = statusConfig[event.status];
            const isClosed = event.status === "registration-closed";
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow flex flex-col"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <div className="space-y-1.5 mb-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <a
                        href={event.venueLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-primary transition-colors"
                      >
                        {event.venue}
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">
                    {event.description}
                  </p>
                  <div className="flex gap-3 mt-auto">
                    <a
                      href={isClosed ? undefined : event.formLink}
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
      </div>
    </section>
  );
};

export default UpcomingEvents;
