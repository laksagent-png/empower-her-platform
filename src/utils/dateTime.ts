import type { Event } from "@/types/firebase";
import { EventStatus } from "@/types/firebase";

/**
 * Format a start and end epoch (milliseconds) into a human-readable event
 * date/time string, e.g. "15 Apr 2026, 10:00 AM – 12:30 PM".
 */
export function formatEventDateTime(startEpoch: number, endEpoch: number): string {
  const locale = "en-IN";
  const timeZone = "Asia/Kolkata";

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  };

  const datePart = new Intl.DateTimeFormat(locale, dateOptions).format(startEpoch);
  const startTime = new Intl.DateTimeFormat(locale, timeOptions).format(startEpoch);
  const endTime = new Intl.DateTimeFormat(locale, timeOptions).format(endEpoch);

  return `${datePart}, ${startTime} – ${endTime}`;
}

/**
 * Generate a Google Maps directions URL from a venue name.
 * If the name is already a URL (starts with "http"), it is returned as-is.
 */
export function getDirectionsUrl(venueName: string): string {
  if (venueName.startsWith("http")) return venueName;
  return `https://maps.google.com/?q=${encodeURIComponent(venueName)}`;
}

/**
 * Filter events that are still upcoming (not yet completed).
 */
export function getUpcomingEvents(events: Event[]): Event[] {
  return events.filter((e) => e.status !== EventStatus.COMPLETED);
}

/**
 * Filter events that have been completed.
 */
export function getPastEvents(events: Event[]): Event[] {
  return events.filter((e) => e.status === EventStatus.COMPLETED);
}
