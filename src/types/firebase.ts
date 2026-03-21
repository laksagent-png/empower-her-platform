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
  /**
   * Hero / cover image URL.
   * Kept for backward compatibility with pre-migration documents.
   * New documents also set `coverImage` with path metadata.
   */
  coverImageUrl: string;
  /**
   * Cover image asset with URL and Storage path for deletion.
   * Present on events created / updated after the storage migration.
   */
  coverImage?: ImageAsset;
  /**
   * Array of gallery image URLs.
   * Kept for backward compatibility; new documents also set `imageAssets`.
   */
  images?: string[];
  /**
   * Gallery image assets with URLs and Storage paths for deletion.
   * Present on events created / updated after the storage migration.
   */
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
