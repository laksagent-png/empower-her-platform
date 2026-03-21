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
 * An event is considered past when its status is COMPLETED.
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

/**
 * Create a new event in Firestore.
 * Automatically sets both `createdAt` and `updatedAt` to the current timestamp.
 * Returns the new document's ID.
 */
export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = Date.now();
  return database.createDocument(EVENTS_COLLECTION, {
    ...data,
    createdAt: now,
    updatedAt: now,
  } as Record<string, unknown>);
}

/**
 * Update an existing event in Firestore.
 * Automatically updates the `updatedAt` timestamp.
 */
export async function updateEvent(
  id: string,
  patch: Partial<Omit<Event, "id" | "createdAt">>
): Promise<void> {
  return database.updateDocument(EVENTS_COLLECTION, id, {
    ...patch,
    updatedAt: Date.now(),
  } as Record<string, unknown>);
}

/**
 * Delete an event from Firestore by its document ID.
 */
export async function deleteEvent(id: string): Promise<void> {
  return database.deleteDocument(EVENTS_COLLECTION, id);
}
