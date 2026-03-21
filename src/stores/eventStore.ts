import { create } from "zustand";
import { type Event } from "@/types/firebase";
import { fetchEvents, createEvent as fbCreateEvent, updateEvent as fbUpdateEvent, deleteEvent as fbDeleteEvent } from "@/services/firebase";

interface EventStore {
  events: Event[];
  loading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => Promise<boolean>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  loading: false,
  error: null,
  
  loadEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await fetchEvents();
      set({ events, loading: false });
    } catch {
      set({ error: "Failed to load events", loading: false });
    }
  },

  addEvent: async (eventData) => {
    try {
      const now = Date.now();
      const newEvent = { ...eventData, createdAt: now, updatedAt: now };
      const id = await fbCreateEvent(newEvent);
      if (id) {
        set((state) => ({
          events: [...state.events, { ...newEvent, id }],
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add event:", error);
      return false;
    }
  },

  updateEvent: async (id, data) => {
    try {
      const success = await fbUpdateEvent(id, { ...data, updatedAt: Date.now() });
      if (success) {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: Date.now() } : e
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update event:", error);
      return false;
    }
  },

  deleteEvent: async (id) => {
    try {
      const success = await fbDeleteEvent(id);
      if (success) {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete event:", error);
      return false;
    }
  },
}));
