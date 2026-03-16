import { z } from "zod";
import { EventStatus } from "@/types/firebase";

export const EventSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(3).max(100),
    startDateTime: z.number().int().positive(),
    endDateTime: z.number().int().positive(),
    venueName: z.string().min(1).max(200),
    venueUrl: z.string().url(),
    description: z.string().min(10).max(500),
    registrationUrl: z.string().url(),
    status: z.nativeEnum(EventStatus),
    coverImageUrl: z.string().url(),
    images: z.array(z.string().url()).min(1).optional(),
    testimonials: z
      .array(
        z.object({
          description: z.string().min(1).max(300),
          username: z.string().min(1).max(100),
        })
      )
      .optional(),
    metrics: z
      .array(
        z.object({
          label: z.string().min(1).max(100),
          value: z.string().min(1).max(100),
        })
      )
      .optional(),
    hostName: z.string().min(1).max(100),
    hostContact: z.string().optional(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .refine((data) => data.endDateTime > data.startDateTime, {
    message: "End time must be after start time",
    path: ["endDateTime"],
  });

export type EventSchemaInput = z.input<typeof EventSchema>;
export type EventSchemaOutput = z.output<typeof EventSchema>;

/**
 * Validate raw data against the Event schema.
 * Returns the parsed event on success, or throws a ZodError on failure.
 */
export function validateEvent(data: unknown): EventSchemaOutput {
  return EventSchema.parse(data);
}
