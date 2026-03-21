import { z } from "zod";

export const ImpactMetricSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Label is required").max(100),
  value: z.number().int().nonnegative("Value must be a non-negative integer"),
  suffix: z.string().max(10).optional(),
  iconKey: z.string().min(1, "Icon is required"),
});

export const ImpactStatsDocSchema = z.object({
  metrics: z.array(ImpactMetricSchema),
  updatedAt: z.number().int(),
  updatedBy: z.string().optional(),
});

export type ImpactMetricInput = z.input<typeof ImpactMetricSchema>;
export type ImpactStatsDocInput = z.input<typeof ImpactStatsDocSchema>;

export function validateImpactStatsDoc(data: unknown) {
  return ImpactStatsDocSchema.parse(data);
}
