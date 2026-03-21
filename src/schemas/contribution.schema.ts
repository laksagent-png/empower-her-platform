import { z } from "zod";

export const BankAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(200),
  accountNumber: z.string().min(1, "Account number is required").max(50),
  ifscCode: z.string().min(1, "IFSC code is required").max(20),
  branch: z.string().min(1, "Branch is required").max(200),
});

export const ContributionDocSchema = z.object({
  upiId: z.string().min(1, "UPI ID is required").max(100),
  qrCodeUrl: z.string().url("Must be a valid URL").optional(),
  bankAccount: BankAccountSchema,
  updatedAt: z.number().int(),
  updatedBy: z.string().optional(),
});

export type BankAccountInput = z.input<typeof BankAccountSchema>;
export type ContributionDocInput = z.input<typeof ContributionDocSchema>;

export function validateContributionDoc(data: unknown) {
  return ContributionDocSchema.parse(data);
}
