import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Impact", href: "#impact" },
  { label: "Events", href: "#events" },
  { label: "Past Events", href: "#past-events" },
  { label: "Contribute", href: "#contribute" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#home" className="font-heading text-2xl font-bold text-primary">
          Aagaj
        </a>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#events"
            className="gradient-warm text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Register Now
          </a>
        </div>
        {/* Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#events"
                onClick={() => setOpen(false)}
                className="gradient-warm text-primary-foreground px-5 py-3 rounded-lg text-base font-semibold text-center mt-2"
              >
                Register Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
