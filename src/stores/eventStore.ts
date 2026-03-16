import { create } from "zustand";
import { EventStatus, type Event } from "@/types/firebase";
import eventDigital from "@/assets/event-digital.jpg";
import eventSelfDefense from "@/assets/event-selfdefense.jpg";
import eventFinance from "@/assets/event-finance.jpg";
import eventEntrepreneur from "@/assets/event-entrepreneur.jpg";
import eventHealth from "@/assets/event-health.jpg";

const now = Date.now();

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Digital Literacy Workshop",
    startDateTime: new Date("2026-04-15T10:00:00").getTime(),
    endDateTime: new Date("2026-04-15T16:00:00").getTime(),
    venueName: "Community Hall, Sector 12, Jaipur",
    venueUrl: "https://maps.google.com/?q=Community+Hall+Sector+12+Jaipur",
    description: "Learn essential computer skills, internet safety, and how to use digital payment platforms.",
    status: EventStatus.FILLING_FAST,
    registrationUrl: "https://forms.google.com",
    coverImageUrl: eventDigital,
    hostName: "Aagaj Foundation",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    title: "Self-Defence Training Camp",
    startDateTime: new Date("2026-04-22T07:00:00").getTime(),
    endDateTime: new Date("2026-04-22T11:00:00").getTime(),
    venueName: "Rajiv Gandhi Stadium, Lucknow",
    venueUrl: "https://maps.google.com/?q=Rajiv+Gandhi+Stadium+Lucknow",
    description: "A hands-on self-defence camp for women of all ages. Professional trainers will guide you.",
    status: EventStatus.ONLINE,
    registrationUrl: "https://forms.google.com",
    coverImageUrl: eventSelfDefense,
    hostName: "Aagaj Foundation",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    title: "Financial Independence Seminar",
    startDateTime: new Date("2026-05-05T11:00:00").getTime(),
    endDateTime: new Date("2026-05-05T15:00:00").getTime(),
    venueName: "Town Hall, Patna",
    venueUrl: "https://maps.google.com/?q=Town+Hall+Patna",
    description: "Understand savings, investments, and government schemes designed for women.",
    status: EventStatus.REGISTRATION_CLOSED,
    registrationUrl: "https://forms.google.com",
    coverImageUrl: eventFinance,
    hostName: "Aagaj Foundation",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p1",
    title: "Entrepreneurship Bootcamp 2025",
    startDateTime: new Date("2025-11-10T09:00:00").getTime(),
    endDateTime: new Date("2025-11-10T17:00:00").getTime(),
    venueName: "Convention Center, Delhi",
    venueUrl: "https://maps.google.com/?q=Convention+Center+Delhi",
    description: "Intensive bootcamp for aspiring women entrepreneurs across six districts.",
    status: EventStatus.COMPLETED,
    registrationUrl: "",
    coverImageUrl: eventEntrepreneur,
    images: [eventEntrepreneur, eventHealth, eventDigital, eventSelfDefense, eventFinance],
    hostName: "Aagaj Foundation",
    metrics: [
      { label: "Women Trained", value: "120" },
      { label: "Businesses Launched", value: "28" },
      { label: "Districts", value: "6" },
    ],
    testimonials: [
      {
        description: "This workshop changed my life. I started my own handicraft business and now support my entire family.",
        username: "Sunita Devi, Participant, Patna",
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p2",
    title: "Women's Health Awareness Camp",
    startDateTime: new Date("2025-09-15T09:00:00").getTime(),
    endDateTime: new Date("2025-09-15T17:00:00").getTime(),
    venueName: "Community Hall, Lucknow",
    venueUrl: "https://maps.google.com/?q=Community+Hall+Lucknow",
    description: "Health awareness camp covering regular checkups, nutrition, and mental wellness.",
    status: EventStatus.COMPLETED,
    registrationUrl: "",
    coverImageUrl: eventHealth,
    images: [eventHealth, eventFinance, eventSelfDefense, eventDigital, eventEntrepreneur],
    hostName: "Aagaj Foundation",
    metrics: [
      { label: "Women Reached", value: "350" },
      { label: "Free Checkups", value: "200" },
      { label: "Villages Covered", value: "12" },
    ],
    testimonials: [
      {
        description: "For the first time, I understood the importance of regular health checkups. Thank you, Aagaj!",
        username: "Meena Kumari, Participant, Lucknow",
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

interface EventStore {
  events: Event[];
  addEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => void;
  updateEvent: (id: string, data: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: initialEvents,
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        { ...event, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() },
      ],
    })),
  updateEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...data, updatedAt: Date.now() } : e
      ),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
}));
