import type { Event } from "@/types/firebase";
import { database } from "./database";
import { validateEvent } from "@/schemas/event.schema";

export { validateEvent };

/** Firestore collection name for events. */
const EVENTS_COLLECTION = "events";

/**
 * Fetch all events from Firestore.
 * Returns an empty array on error.
 */
export async function fetchEvents(): Promise<Event[]> {
  try {
    return await database.fetchCollection<Event>(EVENTS_COLLECTION);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch events:", error);
    }
    return [];
  }
}

/**
 * Fetch a single event by its document ID.
 * Returns null if not found or on error.
 */
export async function fetchEvent(id: string): Promise<Event | null> {
  try {
    return await database.fetchDocument<Event>(EVENTS_COLLECTION, id);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Failed to fetch event "${id}":`, error);
    }
    return null;
  }
}

/**
 * Fetch only upcoming events from Firestore.
 * An event is considered upcoming if its start date/time is in the future.
 */
export async function fetchUpcomingEvents(): Promise<Event[]> {
  const now = Date.now();
  try {
    return await database.fetchCollection<Event>(EVENTS_COLLECTION, {
      field: "startDateTime",
      op: ">=",
      value: now,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch upcoming events:", error);
    }
    return [];
  }
}

/**
 * Fetch only past events from Firestore.
 * An event is considered past if its start date/time is in the past.
 */
export async function fetchPastEvents(): Promise<Event[]> {
  const now = Date.now();
  try {
    return await database.fetchCollection<Event>(EVENTS_COLLECTION, {
      field: "startDateTime",
      op: "<",
      value: now,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch past events:", error);
    }
    return [];
  }
}
