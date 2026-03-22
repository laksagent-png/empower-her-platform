import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContributionDetails, updateContributionDetails } from "@/services/firebase";
import type { ContributionDoc } from "@/types/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const DEFAULT_DOC: Omit<ContributionDoc, "updatedAt"> = {
  upiId: "aagaj@upi",
  bankAccount: {
    accountName: "Aagaj Foundation",
    accountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    branch: "Main Branch, New Delhi",
  },
};

const ContributionSettingsEditor = () => {
  const queryClient = useQueryClient();

  const { data: serverDoc, isLoading } = useQuery({
    queryKey: ["contribution-details"],
    queryFn: fetchContributionDetails,
  });

  const [form, setForm] = useState<Omit<ContributionDoc, "updatedAt">>(DEFAULT_DOC);

  // Sync form from server data
  useEffect(() => {
    if (serverDoc) {
      setForm({
        upiId: serverDoc.upiId ?? DEFAULT_DOC.upiId,
        bankAccount: {
          accountName: serverDoc.bankAccount?.accountName ?? DEFAULT_DOC.bankAccount.accountName,
          accountNumber: serverDoc.bankAccount?.accountNumber ?? DEFAULT_DOC.bankAccount.accountNumber,
          ifscCode: serverDoc.bankAccount?.ifscCode ?? DEFAULT_DOC.bankAccount.ifscCode,
          branch: serverDoc.bankAccount?.branch ?? DEFAULT_DOC.bankAccount.branch,
        },
      });
    }
  }, [serverDoc]);

  const saveMutation = useMutation({
    mutationFn: () => updateContributionDetails(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribution-details"] });
      toast({
        title: "Contribution Details Saved",
        description: "Bank and UPI details updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save contribution details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const setField = (field: keyof Omit<ContributionDoc, "updatedAt" | "bankAccount">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value === "" ? undefined : value }));
  };

  const setBankField = (
    field: keyof ContributionDoc["bankAccount"],
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      bankAccount: { ...prev.bankAccount, [field]: value },
    }));
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Loading contribution details…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Contribution &amp; Bank Details
      </h2>

      {/* UPI */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">UPI</h3>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            UPI ID
          </label>
          <Input
            value={form.upiId}
            placeholder="e.g. aagaj@upi"
            onChange={(e) => setField("upiId", e.target.value)}
          />
        </div>
      </div>

      {/* Bank Account */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Bank Account (NEFT / IMPS)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Account Name
            </label>
            <Input
              value={form.bankAccount.accountName}
              placeholder="e.g. Aagaj Foundation"
              onChange={(e) => setBankField("accountName", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Account Number
            </label>
            <Input
              value={form.bankAccount.accountNumber}
              placeholder="e.g. 1234567890123456"
              onChange={(e) => setBankField("accountNumber", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              IFSC Code
            </label>
            <Input
              value={form.bankAccount.ifscCode}
              placeholder="e.g. SBIN0001234"
              onChange={(e) => setBankField("ifscCode", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Branch
            </label>
            <Input
              value={form.bankAccount.branch}
              placeholder="e.g. Main Branch, New Delhi"
              onChange={(e) => setBankField("branch", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gradient-warm text-primary-foreground"
        >
          {saveMutation.isPending ? "Saving…" : "Save Details"}
        </Button>
      </div>
    </div>
  );
};

export default ContributionSettingsEditor;
