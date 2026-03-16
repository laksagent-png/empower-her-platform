import { create } from "zustand";
import eventDigital from "@/assets/event-digital.jpg";
import eventSelfDefense from "@/assets/event-selfdefense.jpg";
import eventFinance from "@/assets/event-finance.jpg";
import eventEntrepreneur from "@/assets/event-entrepreneur.jpg";
import eventHealth from "@/assets/event-health.jpg";

export type EventStatus = "filling-fast" | "registration-closed" | "online";
export type EventType = "upcoming" | "past";

export interface EventData {
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
  type: EventType;
  // Past-event specific
  metrics?: { label: string; value: string }[];
  testimonial?: { quote: string; name: string; role: string };
  gallery?: string[];
}

const initialEvents: EventData[] = [
  {
    id: "1",
    title: "Digital Literacy Workshop",
    date: "15th April 2026",
    time: "10:00 AM – 4:00 PM",
    venue: "Community Hall, Sector 12, Jaipur",
    venueLink: "https://maps.google.com/?q=Community+Hall+Sector+12+Jaipur",
    description: "Learn essential computer skills, internet safety, and how to use digital payment platforms.",
    status: "filling-fast",
    formLink: "https://forms.google.com",
    image: eventDigital,
    type: "upcoming",
  },
  {
    id: "2",
    title: "Self-Defence Training Camp",
    date: "22nd April 2026",
    time: "7:00 AM – 11:00 AM",
    venue: "Rajiv Gandhi Stadium, Lucknow",
    venueLink: "https://maps.google.com/?q=Rajiv+Gandhi+Stadium+Lucknow",
    description: "A hands-on self-defence camp for women of all ages.",
    status: "online",
    formLink: "https://forms.google.com",
    image: eventSelfDefense,
    type: "upcoming",
  },
  {
    id: "3",
    title: "Financial Independence Seminar",
    date: "5th May 2026",
    time: "11:00 AM – 3:00 PM",
    venue: "Town Hall, Patna",
    venueLink: "https://maps.google.com/?q=Town+Hall+Patna",
    description: "Understand savings, investments, and government schemes designed for women.",
    status: "registration-closed",
    formLink: "https://forms.google.com",
    image: eventFinance,
    type: "upcoming",
  },
  {
    id: "p1",
    title: "Entrepreneurship Bootcamp 2025",
    date: "November 2025",
    time: "",
    venue: "",
    venueLink: "",
    description: "",
    status: "registration-closed",
    formLink: "",
    image: eventEntrepreneur,
    type: "past",
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
    gallery: [eventEntrepreneur, eventHealth, eventDigital, eventSelfDefense, eventFinance],
  },
  {
    id: "p2",
    title: "Women's Health Awareness Camp",
    date: "September 2025",
    time: "",
    venue: "",
    venueLink: "",
    description: "",
    status: "registration-closed",
    formLink: "",
    image: eventHealth,
    type: "past",
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
    gallery: [eventHealth, eventFinance, eventSelfDefense, eventDigital, eventEntrepreneur],
  },
];

interface EventStore {
  events: EventData[];
  addEvent: (event: Omit<EventData, "id">) => void;
  updateEvent: (id: string, data: Partial<EventData>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: initialEvents,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: crypto.randomUUID() }],
    })),
  updateEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
}));
