import { MessageCircle } from "lucide-react";

const WhatsAppFAB = () => {
  return (
    <a
      href="https://wa.me/919876543210?text=Hi%20Aagaj!%20I%20want%20to%20know%20more%20about%20your%20upcoming%20events."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
};

export default WhatsAppFAB;
