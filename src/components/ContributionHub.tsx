import { motion } from "framer-motion";
import { Copy, Check, Banknote, Heart, ExternalLink, QrCode } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContributionDetails } from "@/services/firebase";

const DEFAULT_BANK = {
  name: "Aagaj Foundation",
  account: "1234567890123456",
  ifsc: "SBIN0001234",
  branch: "Main Branch, New Delhi",
};

const DEFAULT_UPI = "aagaj@upi";

const ContributionHub = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: contributionDoc } = useQuery({
    queryKey: ["contribution-details"],
    queryFn: fetchContributionDetails,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Resolve values from Firestore or fall back to defaults
  const upiId = contributionDoc?.upiId ?? DEFAULT_UPI;
  const qrCodeUrl = contributionDoc?.qrCodeUrl ?? "";
  const bankDetails = {
    name: contributionDoc?.bankAccount?.accountName ?? DEFAULT_BANK.name,
    account: contributionDoc?.bankAccount?.accountNumber ?? DEFAULT_BANK.account,
    ifsc: contributionDoc?.bankAccount?.ifscCode ?? DEFAULT_BANK.ifsc,
    branch: contributionDoc?.bankAccount?.branch ?? DEFAULT_BANK.branch,
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copyText(text, label)}
      className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
      aria-label={`Copy ${label}`}
    >
      {copied === label ? <Check size={16} className="text-secondary" /> : <Copy size={16} />}
    </button>
  );

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=Aagaj%20Foundation&cu=INR`;

  return (
    <section id="contribute" className="py-20 md:py-28 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">
            Contribute
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">
            Support the Movement
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-6 md:p-8 shadow-card space-y-6"
          >
            {/* Trust badge */}
            <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
              <Heart size={16} />
              Aagaj Foundation is 80G Tax Exempted
            </div>

            {/* UPI */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Banknote size={20} className="text-primary" />
                Pay via UPI
              </h3>
              <div className="flex items-center gap-3 bg-background rounded-lg p-4 border border-border">
                <a
                  href={upiDeepLink}
                  className="font-mono text-lg font-semibold text-foreground flex-1"
                >
                  {upiId}
                </a>
                <CopyBtn text={upiId} label="upi" />
              </div>
              <a
                href={upiDeepLink}
                className="gradient-warm text-primary-foreground w-full py-3 rounded-lg font-semibold text-center min-h-[48px] flex items-center justify-center md:hidden"
              >
                Open UPI App
              </a>

              {/* QR Code (shown only when URL is stored in Firestore) */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <QrCode size={14} />
                    <span>Scan to Pay</span>
                  </div>
                  <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-32 h-32 object-contain rounded-lg border border-border hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              )}
            </div>

            {/* Bank */}
            <div className="space-y-3">
              <h3 className="font-heading text-lg font-bold text-foreground">
                Bank Transfer (NEFT/IMPS)
              </h3>
              <div className="bg-background rounded-lg border border-border divide-y divide-border">
                {[
                  { label: "Account Name", value: bankDetails.name },
                  { label: "A/C Number", value: bankDetails.account },
                  { label: "IFSC Code", value: bankDetails.ifsc },
                  { label: "Branch", value: bankDetails.branch },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                    <CopyBtn text={item.value} label={item.label} />
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer */}
            <div className="pt-4 border-t border-border">
              <a
                href="https://forms.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-secondary text-secondary font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors min-h-[48px]"
              >
                <ExternalLink size={16} />
                Volunteer With Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContributionHub;
