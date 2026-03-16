import type { Event } from "@/types/firebase";
import { EventStatus } from "@/types/firebase";
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
 * Fetch only upcoming (non-completed) events from Firestore.
 */
export async function fetchUpcomingEvents(): Promise<Event[]> {
  try {
    return await database.fetchCollection<Event>(EVENTS_COLLECTION, {
      field: "status",
      op: "!=",
      value: EventStatus.COMPLETED,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch upcoming events:", error);
    }
    return [];
  }
}

/**
 * Fetch only completed (past) events from Firestore.
 */
export async function fetchPastEvents(): Promise<Event[]> {
  try {
    return await database.fetchCollection<Event>(EVENTS_COLLECTION, {
      field: "status",
      op: "==",
      value: EventStatus.COMPLETED,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch past events:", error);
    }
    return [];
  }
}
