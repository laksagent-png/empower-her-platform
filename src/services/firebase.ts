import type { Event, ImpactStatsDoc, ContributionDoc } from "@/types/firebase";
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

// ---------- Impact Metrics (stats/impact) ----------

const STATS_COLLECTION = "stats";
const IMPACT_DOC_ID = "impact";

/**
 * Fetch the dynamic impact metrics document.
 * Returns null if the document does not exist or on error.
 */
export async function fetchImpactStats(): Promise<ImpactStatsDoc | null> {
  try {
    return await database.fetchDocument<ImpactStatsDoc>(STATS_COLLECTION, IMPACT_DOC_ID);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch impact stats:", error);
    }
    return null;
  }
}

/**
 * Persist the dynamic impact metrics document (full overwrite).
 */
export async function updateImpactStats(
  doc: Omit<ImpactStatsDoc, "updatedAt">,
  updatedBy?: string
): Promise<void> {
  const payload: ImpactStatsDoc = {
    ...doc,
    updatedAt: Date.now(),
    ...(updatedBy ? { updatedBy } : {}),
  };
  try {
    await database.upsertDocument(STATS_COLLECTION, IMPACT_DOC_ID, payload as Record<string, unknown>);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to update impact stats:", error);
    }
    throw error;
  }
}

// ---------- Contribution / Bank Details (settings/contribution) ----------

const SETTINGS_COLLECTION = "settings";
const CONTRIBUTION_DOC_ID = "contribution";

/**
 * Fetch the contribution / bank details document.
 * Returns null if the document does not exist or on error.
 */
export async function fetchContributionDetails(): Promise<ContributionDoc | null> {
  try {
    return await database.fetchDocument<ContributionDoc>(SETTINGS_COLLECTION, CONTRIBUTION_DOC_ID);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch contribution details:", error);
    }
    return null;
  }
}

/**
 * Persist the contribution / bank details document (full overwrite).
 */
export async function updateContributionDetails(
  doc: Omit<ContributionDoc, "updatedAt">,
  updatedBy?: string
): Promise<void> {
  const payload: ContributionDoc = {
    ...doc,
    updatedAt: Date.now(),
    ...(updatedBy ? { updatedBy } : {}),
  };
  try {
    await database.upsertDocument(SETTINGS_COLLECTION, CONTRIBUTION_DOC_ID, payload as Record<string, unknown>);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to update contribution details:", error);
    }
    throw error;
  }
}
