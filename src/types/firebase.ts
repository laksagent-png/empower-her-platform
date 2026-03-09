export type EventStatus = "Filling Fast" | "Registration Closed" | "Online";

export interface Event {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  status: EventStatus;
  imageUrl?: string;
}

export interface HistoricalEvent extends Event {
  images: string[];
  testimonial: string;
  metricsCount: number;
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
