/**
 * Example event data for reference and testing purposes.
 *
 * These events illustrate how Firestore documents should be shaped
 * according to the Event interface and EventSchema.
 */

import { EventStatus } from "../src/types/firebase";
import type { Event } from "../src/types/firebase";

/** Upcoming workshop – filling fast */
export const digitalLiteracyWorkshop: Event = {
  id: "event_001",
  title: "Digital Literacy Workshop",
  startDateTime: 1744761000000, // 15 Apr 2026, 10:00 AM IST
  endDateTime: 1744768200000, // 15 Apr 2026, 12:00 PM IST
  venueName: "Women's Resource Center, Bangalore",
  venueUrl: "https://maps.google.com/?q=Women%27s+Resource+Center+Bangalore",
  description:
    "Learn essential digital skills including MS Office, email, and online safety. Equip yourself with tools for modern employment.",
  registrationUrl: "https://forms.google.com/aagaj-digital-literacy",
  status: EventStatus.FILLING_FAST,
  coverImageUrl: "https://firebase.com/storage/event-001-cover.jpg",
  images: [
    "https://firebase.com/storage/event-001-img-1.jpg",
    "https://firebase.com/storage/event-001-img-2.jpg",
    "https://firebase.com/storage/event-001-img-3.jpg",
  ],
  testimonials: [
    {
      description: "This workshop changed my life. I got a job as a data entry operator!",
      username: "Priya M.",
    },
  ],
  metrics: [
    { label: "Women Trained", value: "150" },
    { label: "Placed in Jobs", value: "45" },
  ],
  createdAt: 1744500000000,
  updatedAt: 1744500000000,
};

/** Past event – completed */
export const skillDevelopmentWorkshop: Event = {
  id: "event_002",
  title: "Skill Development & Employability",
  startDateTime: 1742083800000, // 18 Mar 2026, 9:00 AM IST
  endDateTime: 1742091000000, // 18 Mar 2026, 11:00 AM IST
  venueName: "Chennai Women's Empowerment Hub",
  venueUrl: "https://maps.google.com/?q=Chennai+Women%27s+Empowerment+Hub",
  description:
    "Interactive session on resume building, interview preparation, and confidence building for job interviews.",
  registrationUrl: "https://forms.google.com/aagaj-skill-dev",
  status: EventStatus.COMPLETED,
  coverImageUrl: "https://firebase.com/storage/event-002-cover.jpg",
  images: [
    "https://firebase.com/storage/event-002-img-1.jpg",
    "https://firebase.com/storage/event-002-img-2.jpg",
    "https://firebase.com/storage/event-002-img-3.jpg",
    "https://firebase.com/storage/event-002-img-4.jpg",
  ],
  testimonials: [
    {
      description: "The interview tips were incredible. I'm now working at TCS!",
      username: "Anjali Singh",
    },
    {
      description: "Best workshop ever. Very practical and relatable.",
      username: "Deepa Nair",
    },
    {
      description: "The confidence I gained here is priceless.",
      username: "Fatima Khan",
    },
  ],
  metrics: [
    { label: "Participants", value: "200" },
    { label: "Placed in Jobs", value: "72" },
    { label: "Average Salary", value: "₹18,000/month" },
    { label: "Success Rate", value: "36%" },
  ],
  createdAt: 1741900000000,
  updatedAt: 1742000000000,
};

/** Online event – registration closed */
export const financialIndependenceSeminar: Event = {
  id: "event_003",
  title: "Financial Independence for Women",
  startDateTime: 1745980800000, // 5 May 2026, 4:00 PM IST
  endDateTime: 1745988000000, // 5 May 2026, 6:00 PM IST
  venueName: "Online (Google Meet)",
  venueUrl: "https://meet.google.com/aagaj-financial-literacy",
  description:
    "Understand budgeting, savings, and investment basics. Learn how to build financial security for yourself and your family.",
  registrationUrl: "https://forms.google.com/aagaj-financial-literacy",
  status: EventStatus.REGISTRATION_CLOSED,
  coverImageUrl: "https://firebase.com/storage/event-003-cover.jpg",
  images: ["https://firebase.com/storage/event-003-img-1.jpg"],
  testimonials: [
    {
      description: "Finally understand how to manage my money wisely!",
      username: "Ramya D.",
    },
  ],
  metrics: [
    { label: "Registered Participants", value: "500" },
    { label: "Capacity", value: "500" },
  ],
  createdAt: 1745800000000,
  updatedAt: 1745800000000,
};

export const exampleEvents: Event[] = [
  digitalLiteracyWorkshop,
  skillDevelopmentWorkshop,
  financialIndependenceSeminar,
];
