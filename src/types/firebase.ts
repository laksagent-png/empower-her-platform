export type EventStatus = "Filling Fast" | "Registration Closed" | "Online";

export interface Event {
  title: string;
  /** Unix epoch timestamp (milliseconds) representing the event date and time. */
  date: number;
  venue: string;
  /** Optional Google Maps link for the venue. */
  venueMapUrl?: string;
  description: string;
  registrationUrl?: string;
  status: EventStatus;
  coverImageUrl?: string;
}

export interface HistoricalEvent extends Event {
  images: string[];
  testimonial: string;
  /** Dynamic per-event metrics, e.g. [{ label: "Stationary kits distributed", value: "100" }] */
  metrics: Array<{ label: string; value: string }>;
}

export interface GlobalStats {
  womenEmpowered: number;
  workshopsHeld: number;
  districtsReached: number;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

export interface ContributionDetails {
  upiId: string;
  bankAccount: BankAccount;
  qrCodeUrl: string;
}
