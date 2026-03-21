export enum EventStatus {
  FILLING_FAST = "FILLING_FAST",
  REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
  ONLINE = "ONLINE",
  COMPLETED = "COMPLETED",
}

export interface Event {
  id: string;
  title: string;
  /** Unix epoch timestamp (milliseconds) for when the event starts. */
  startDateTime: number;
  /** Unix epoch timestamp (milliseconds) for when the event ends. */
  endDateTime: number;
  /** Location name, e.g. "Women's Resource Center, Bangalore". */
  venueName: string;
  /** Google Maps or location URL for the venue. */
  venueUrl: string;
  description: string;
  /** Google Form or external registration URL. */
  registrationUrl: string;
  status: EventStatus;
  /** Hero / cover image URL. */
  coverImageUrl: string;
  /** Array of gallery image URLs. */
  images?: string[];
  testimonials?: Array<{
    description: string;
    username: string;
  }>;
  /** Dynamic per-event metrics, e.g. [{ label: "Women Trained", value: "150" }] */
  metrics?: Array<{ label: string; value: string }>;
  /** Name of the event host. */
  hostName: string;
  /** Contact number of the event host (optional). */
  hostContact?: string;
  /** Unix epoch timestamp (milliseconds) when the record was created. */
  createdAt: number;
  /** Unix epoch timestamp (milliseconds) when the record was last updated. */
  updatedAt: number;
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
