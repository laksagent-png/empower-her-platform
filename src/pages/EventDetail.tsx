import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, ExternalLink, Share2,
  ArrowLeft, Quote, X, ChevronLeft, ChevronRight,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { fetchEvent } from "@/services/firebase";
import { EventStatus, type Event } from "@/types/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GALLERY_INITIAL = 4;
const GALLERY_PAGE = 8;

const statusConfig: Record<EventStatus, { label: string; className: string } | undefined> = {
  [EventStatus.FILLING_FAST]: { label: "Filling Fast", className: "bg-accent text-accent-foreground" },
  [EventStatus.REGISTRATION_CLOSED]: { label: "Registration Closed", className: "bg-muted text-muted-foreground" },
  [EventStatus.ONLINE]: { label: "Online", className: "bg-secondary text-secondary-foreground" },
  [EventStatus.COMPLETED]: { label: "Completed", className: "bg-muted text-muted-foreground" },
};

const handleShare = (event: Event) => {
  const dateStr = format(new Date(event.startDateTime), "dd MMM yyyy");
  const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/events/${event.id}`;
  const text = `Check out "${event.title}" by Aagaj on ${dateStr}!`;
  if (navigator.share) {
    navigator.share({ title: event.title, text, url });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  }
};

/** Image with skeleton placeholder until loaded */
const GalleryImage = ({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <button onClick={onClick} className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity relative">
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </button>
  );
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });

  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [galleryVisible, setGalleryVisible] = useState(GALLERY_INITIAL);
  const closeLightbox = () => setLightbox(null);
  const navigateLightbox = useCallback(
    (dir: 1 | -1) => {
      if (!lightbox) return;
      const next = (lightbox.index + dir + lightbox.images.length) % lightbox.images.length;
      setLightbox({ ...lightbox, index: next });
    },
    [lightbox]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[event.status];
  const isClosed = event.status === EventStatus.REGISTRATION_CLOSED;
  const isCompleted = event.status === EventStatus.COMPLETED;
  const gallery = (event.imageAssets ?? []).map((a) => a.url);
  const shownGallery = gallery.slice(0, galleryVisible);
  const hasMorePhotos = galleryVisible < gallery.length;
  const backHash = isCompleted ? "/#past-events" : "/#events";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <img src={event.coverImage.url} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container">
            {status && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${status.className}`}>
                {status.label}
              </span>
            )}
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container py-10 md:py-16">
        <Link to={backHash} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mb-8">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">About this Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Metrics */}
            {event.metrics && event.metrics.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Impact</h2>
                <div className="grid grid-cols-3 gap-4">
                  {event.metrics.map((m) => (
                    <div key={m.label} className="bg-card rounded-xl p-4 text-center shadow-card">
                      <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{m.value}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {event.testimonials && event.testimonials.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Testimonials</h2>
                <div className="space-y-4">
                  {event.testimonials.map((t, i) => (
                    <div key={i} className="bg-card rounded-xl p-5 flex gap-4 items-start shadow-card">
                      <Quote size={24} className="text-primary shrink-0 mt-1" />
                      <div>
                        <p className="text-foreground italic mb-2">"{t.description}"</p>
                        <p className="text-sm font-semibold text-foreground">— {t.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {shownGallery.map((img, idx) => (
                    <GalleryImage
                      key={idx}
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      onClick={() => setLightbox({ images: gallery, index: idx })}
                    />
                  ))}
                </div>
                {hasMorePhotos && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setGalleryVisible((c) => c + GALLERY_PAGE)}
                      className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors min-h-[48px]"
                    >
                      Load More Photos
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
              {isCompleted && (
                <div className="flex items-center gap-2 text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-2">
                  <CheckCircle size={16} className="text-secondary" />
                  <span className="text-sm font-medium">This event has concluded</span>
                </div>
              )}

              <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {isCompleted ? "When & Where It Took Place" : "Event Details"}
              </h3>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar size={18} className="text-primary" />
                <span>
                  {isCompleted ? "Held on " : ""}
                  {format(new Date(event.startDateTime), "EEEE, dd MMMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock size={18} className="text-primary" />
                <span>
                  {format(new Date(event.startDateTime), "h:mm a")} – {format(new Date(event.endDateTime), "h:mm a")}
                </span>
              </div>
              {event.venueName && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin size={18} className="text-primary" />
                  <a
                    href={event.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary transition-colors"
                  >
                    {event.venueName}
                  </a>
                </div>
              )}
              {event.hostName && (
                <p className="text-sm text-muted-foreground">
                  Hosted by <span className="font-semibold text-foreground">{event.hostName}</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!isCompleted && (
                <a
                  href={isClosed ? undefined : event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold min-h-[48px] transition-opacity ${
                    isClosed
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "gradient-warm text-primary-foreground hover:opacity-90"
                  }`}
                  onClick={(e) => isClosed && e.preventDefault()}
                >
                  <ExternalLink size={16} />
                  {isClosed ? "Registration Closed" : "Register Now"}
                </a>
              )}
              <button
                onClick={() => handleShare(event)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors min-h-[48px] text-sm font-semibold"
              >
                <Share2 size={16} /> Share Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button className="absolute top-4 right-4 text-primary-foreground p-2" onClick={closeLightbox} aria-label="Close">
              <X size={28} />
            </button>
            <button className="absolute left-4 text-primary-foreground p-2" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }} aria-label="Previous">
              <ChevronLeft size={36} />
            </button>
            <img src={lightbox.images[lightbox.index]} alt="Gallery" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 text-primary-foreground p-2" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }} aria-label="Next">
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;
