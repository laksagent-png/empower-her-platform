export type EventStatus = "Filling Fast" | "Registration Closed" | "Online";

export interface Event {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl: string;
  status: EventStatus;
  imageUrl?: string;
}

export interface HistoricalEvent {
  title: string;
  images: string[];
  testimonial: string;
  metricsCount: number;
}

export interface GlobalStats {
  womenEmpowered: number;
  workshopsHeld: number;
  districtsReached: number;
}

export interface ContributionDetails {
  upiId: string;
  bankAccount: string;
  qrCodeUrl: string;
}

export interface DonationLink {
  platform: string;
  url: string;
}
