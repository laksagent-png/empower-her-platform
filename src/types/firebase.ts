export enum EventStatus {
  FILLING_FAST = "FILLING_FAST",
  REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
  ONLINE = "ONLINE",
  COMPLETED = "COMPLETED",
}

/**
 * A stored image asset with a public download URL and the Firebase Storage
 * object path needed for deletion.
 */
export interface ImageAsset {
  /** Public Firebase Storage download URL. */
  url: string;
  /** Firebase Storage object path, e.g. "events/tmp/{sessionId}/cover/...". */
  path: string;
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
  /** Cover image asset with public URL and Firebase Storage path for deletion. */
  coverImage: ImageAsset;
  /** Gallery image assets with public URLs and Firebase Storage paths for deletion. */
  imageAssets?: ImageAsset[];
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

/**
 * A single dynamically-configured impact metric shown in ImpactSection.
 * `iconKey` maps to a Lucide icon via the IMPACT_ICONS whitelist.
 */
export interface ImpactMetric {
  /** Stable identifier (nanoid / uuid) for list operations. */
  id: string;
  label: string;
  value: number;
  /** Optional display suffix, e.g. "+" or "k+". */
  suffix?: string;
  /** Key into the IMPACT_ICONS constant. */
  iconKey: string;
}

/** Firestore document stored at stats/impact. */
export interface ImpactStatsDoc {
  metrics: ImpactMetric[];
  updatedAt: number;
  updatedBy?: string;
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
  qrCodeUrl?: string;
}

/** Firestore document stored at settings/contribution. */
export interface ContributionDoc extends ContributionDetails {
  updatedAt: number;
  updatedBy?: string;
}
