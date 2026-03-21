import { useState, useRef, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { EventStatus, type Event, type ImageAsset } from "@/types/firebase";
import { firebaseBlobStorage } from "@/services/providers/firebase/blob-storage";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

// ---------- Zod form schema ----------

const imageAssetSchema = z.object({ url: z.string().url(), path: z.string() });

const formSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    startDateTime: z.number().int().positive("Start date & time is required"),
    endDateTime: z.number().int().positive("End date & time is required"),
    venueName: z.string().min(1, "Venue name is required").max(200),
    venueUrl: z.string().url("Must be a valid URL"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500),
    registrationUrl: z.string().url("Must be a valid URL").or(z.literal("")),
    status: z.nativeEnum(EventStatus),
    /** Backward-compat string URL; always derived from coverImage.url on save. */
    coverImageUrl: z.string().min(1, "Cover image is required"),
    /** New: cover image with Storage path for deletion. */
    coverImage: imageAssetSchema.optional(),
    /** Backward-compat URL array; always derived from imageAssets on save. */
    images: z.array(z.string()).optional(),
    /** New: gallery assets with Storage paths for deletion. */
    imageAssets: z.array(imageAssetSchema).optional(),
    testimonials: z
      .array(z.object({ description: z.string().min(1), username: z.string().min(1) }))
      .optional(),
    metrics: z
      .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
      .optional(),
    hostName: z.string().min(1, "Host name is required").max(100),
    hostContact: z.string().optional(),
  })
  .refine((d) => d.endDateTime > d.startDateTime, {
    message: "End time must be after start time",
    path: ["endDateTime"],
  });

type FormData = z.input<typeof formSchema>;

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: EventStatus.FILLING_FAST, label: "Filling Fast" },
  { value: EventStatus.ONLINE, label: "Online" },
  { value: EventStatus.REGISTRATION_CLOSED, label: "Registration Closed" },
  { value: EventStatus.COMPLETED, label: "Completed" },
];

const emptyForm: FormData = {
  title: "",
  startDateTime: 0,
  endDateTime: 0,
  venueName: "",
  venueUrl: "",
  description: "",
  registrationUrl: "",
  status: EventStatus.FILLING_FAST,
  coverImageUrl: "",
  coverImage: undefined,
  images: [],
  imageAssets: [],
  testimonials: [],
  metrics: [],
  hostName: "",
  hostContact: "",
};

/**
 * Normalise an event (potentially old-schema) into FormData.
 * Old-schema events have `coverImageUrl: string` and `images: string[]` but no
 * `coverImage` / `imageAssets`.  We convert them to ImageAsset objects with an
 * empty `path` so they display correctly; deletion won't be attempted for
 * assets with an empty path.
 */
function eventToForm(event: Event): FormData {
  const coverImage: ImageAsset | undefined =
    event.coverImage ?? { url: event.coverImageUrl, path: "" };

  const imageAssets: ImageAsset[] =
    event.imageAssets ??
    (event.images ?? []).map((url) => ({ url, path: "" }));

  return {
    title: event.title,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    venueName: event.venueName,
    venueUrl: event.venueUrl,
    description: event.description,
    registrationUrl: event.registrationUrl,
    status: event.status,
    coverImageUrl: coverImage.url,
    coverImage,
    images: imageAssets.map((a) => a.url),
    imageAssets,
    testimonials: event.testimonials ?? [],
    metrics: event.metrics ?? [],
    hostName: event.hostName,
    hostContact: event.hostContact ?? "",
  };
}

/** Sanitise a filename: replace whitespace and non-safe chars. */
function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

/** Build a unique storage path for an upload. */
function buildStoragePath(
  sessionId: string,
  slot: "cover" | "gallery",
  filename: string
): string {
  const safe = sanitizeFilename(filename);
  const rand = Math.random().toString(36).slice(2, 8);
  return `events/tmp/${sessionId}/${slot}/${Date.now()}-${rand}-${safe}`;
}

// ---------- Millis ↔ date/time helpers ----------

function millisToDate(ms: number): Date | undefined {
  return ms > 0 ? new Date(ms) : undefined;
}

function millisToTimeStr(ms: number): string {
  if (ms <= 0) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function combineDateAndTime(date: Date | undefined, time: string): number {
  if (!date) return 0;
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

// ---------- Props ----------

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: Event | null;
  onSave: (data: Omit<Event, "id" | "createdAt" | "updatedAt">, editingId: string | null) => void;
}

// ---------- Component ----------

const EventFormDialog = ({ open, onOpenChange, editingEvent, onSave }: Props) => {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Paths uploaded during the current dialog session (reset on open).
   * Used to clean up orphan Storage objects when the dialog is closed without saving.
   */
  const [sessionUploadedPaths, setSessionUploadedPaths] = useState<string[]>([]);

  /** Stable UUID for this upload session; regenerated each time the dialog opens. */
  const [uploadSessionId, setUploadSessionId] = useState(() => crypto.randomUUID());

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Derived date/time state from millis
  const startDate = millisToDate(form.startDateTime);
  const startTime = millisToTimeStr(form.startDateTime);
  const endDate = millisToDate(form.endDateTime);
  const endTime = millisToTimeStr(form.endDateTime);

  // Sync form and reset session state when dialog opens
  useEffect(() => {
    if (open) {
      setUploadSessionId(crypto.randomUUID());
      setSessionUploadedPaths([]);
      setForm(editingEvent ? eventToForm(editingEvent) : emptyForm);
      setErrors({});
    }
  }, [open, editingEvent]);

  /**
   * Best-effort cleanup of orphaned uploads when the dialog is closed without saving.
   * Paths that are still referenced in the current form state are skipped.
   */
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && sessionUploadedPaths.length > 0) {
        const savedPaths = new Set([
          form.coverImage?.path ?? "",
          ...((form.imageAssets ?? []).map((a) => a.path)),
        ]);
        const toDelete = sessionUploadedPaths.filter(
          (p) => p && !savedPaths.has(p)
        );
        for (const path of toDelete) {
          firebaseBlobStorage.deleteFile(path).catch(() => {
            // best-effort; ignore errors during orphan cleanup
          });
        }
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, sessionUploadedPaths, form.coverImage, form.imageAssets]
  );

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Date/time setters
  const setStartDate = (d: Date | undefined) =>
    updateField("startDateTime", combineDateAndTime(d, startTime || "00:00"));
  const setStartTime = (t: string) =>
    updateField("startDateTime", combineDateAndTime(startDate, t));
  const setEndDate = (d: Date | undefined) =>
    updateField("endDateTime", combineDateAndTime(d, endTime || "00:00"));
  const setEndTime = (t: string) =>
    updateField("endDateTime", combineDateAndTime(endDate, t));

  // ---------- Upload handlers ----------

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const storagePath = buildStoragePath(uploadSessionId, "cover", file.name);
      const asset = await firebaseBlobStorage.uploadFile(file, storagePath);
      setSessionUploadedPaths((prev) => [...prev, asset.path]);
      setForm((prev) => ({
        ...prev,
        coverImageUrl: asset.url,
        coverImage: asset,
      }));
    } catch (err) {
      if (import.meta.env.DEV) console.error("Cover upload failed:", err);
      toast({ title: "Upload Failed", description: "Could not upload cover image.", variant: "destructive" });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      const newAssets: ImageAsset[] = [];
      for (const file of Array.from(files)) {
        const storagePath = buildStoragePath(uploadSessionId, "gallery", file.name);
        const asset = await firebaseBlobStorage.uploadFile(file, storagePath);
        setSessionUploadedPaths((prev) => [...prev, asset.path]);
        newAssets.push(asset);
      }
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images ?? []), ...newAssets.map((a) => a.url)],
        imageAssets: [...(prev.imageAssets ?? []), ...newAssets],
      }));
    } catch (err) {
      if (import.meta.env.DEV) console.error("Gallery upload failed:", err);
      toast({ title: "Upload Failed", description: "Could not upload one or more images.", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
    }
  };

  // ---------- Remove / delete handlers ----------

  const removeCoverImage = async () => {
    const path = form.coverImage?.path;
    if (path) {
      setIsDeleting(true);
      try {
        await firebaseBlobStorage.deleteFile(path);
        // Remove from session-tracking (no longer an orphan to clean up)
        setSessionUploadedPaths((prev) => prev.filter((p) => p !== path));
      } catch (err) {
        if (import.meta.env.DEV) console.error("Cover image deletion failed:", err);
        toast({
          title: "Deletion Failed",
          description: "Could not remove the cover image from storage. Please try again.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return; // keep the image in state on failure
      } finally {
        setIsDeleting(false);
      }
    }
    setForm((prev) => ({ ...prev, coverImageUrl: "", coverImage: undefined }));
  };

  const removeGalleryImage = async (idx: number) => {
    const asset = (form.imageAssets ?? [])[idx];
    if (asset?.path) {
      setIsDeleting(true);
      try {
        await firebaseBlobStorage.deleteFile(asset.path);
        setSessionUploadedPaths((prev) => prev.filter((p) => p !== asset.path));
      } catch (err) {
        if (import.meta.env.DEV) console.error("Gallery image deletion failed:", err);
        toast({
          title: "Deletion Failed",
          description: "Could not remove the image from storage. Please try again.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return; // keep the image in state on failure
      } finally {
        setIsDeleting(false);
      }
    }
    setForm((prev) => ({
      ...prev,
      images: (prev.images ?? []).filter((_, i) => i !== idx),
      imageAssets: (prev.imageAssets ?? []).filter((_, i) => i !== idx),
    }));
  };

  // ---------- Metrics helpers ----------

  const addMetric = () => updateField("metrics", [...(form.metrics ?? []), { label: "", value: "" }]);
  const updateMetric = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...(form.metrics ?? [])];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField("metrics", updated);
  };
  const removeMetric = (idx: number) => updateField("metrics", (form.metrics ?? []).filter((_, i) => i !== idx));

  // ---------- Testimonials helpers ----------

  const addTestimonial = () =>
    updateField("testimonials", [...(form.testimonials ?? []), { description: "", username: "" }]);
  const updateTestimonial = (idx: number, field: "description" | "username", val: string) => {
    const updated = [...(form.testimonials ?? [])];
    updated[idx] = { ...updated[idx], [field]: val };
    updateField("testimonials", updated);
  };
  const removeTestimonial = (idx: number) =>
    updateField("testimonials", (form.testimonials ?? []).filter((_, i) => i !== idx));

  // ---------- Submit ----------

  const handleSave = () => {
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = e.message;
      });
      setErrors(fieldErrors);
      toast({ title: "Validation Error", description: "Please fix the highlighted fields.", variant: "destructive" });
      return;
    }
    setErrors({});
    // Clear session paths — these are now saved; skip orphan cleanup on close
    setSessionUploadedPaths([]);
    const eventData: Omit<Event, "id" | "createdAt" | "updatedAt"> = {
      ...result.data,
      imageAssets: result.data.imageAssets ?? [],
    };
    onSave(eventData, editingEvent?.id ?? null);
  };

  const isBusy = uploadingCover || uploadingGallery || isDeleting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {editingEvent ? "Update event details below." : "Fill in event details to publish."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Title */}
          <Field label="Title" required error={errors.title}>
            <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Digital Literacy Workshop" />
          </Field>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" required error={errors.startDateTime}>
              <DatePicker date={startDate} onSelect={setStartDate} />
            </Field>
            <Field label="Start Time" required>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="End Date" required error={errors.endDateTime}>
              <DatePicker date={endDate} onSelect={setEndDate} />
            </Field>
            <Field label="End Time" required>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>

          {/* Venue */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Venue Name" required error={errors.venueName}>
              <Input value={form.venueName} onChange={(e) => updateField("venueName", e.target.value)} />
            </Field>
            <Field label="Venue Map URL" required error={errors.venueUrl}>
              <Input value={form.venueUrl} onChange={(e) => updateField("venueUrl", e.target.value)} placeholder="https://maps.google.com/..." />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" required error={errors.description}>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} maxLength={500} />
            <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
          </Field>

          {/* Status & Registration */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" required>
              <Select value={form.status} onValueChange={(v) => updateField("status", v as EventStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Registration URL" error={errors.registrationUrl}>
              <Input value={form.registrationUrl} onChange={(e) => updateField("registrationUrl", e.target.value)} placeholder="https://forms.google.com/..." />
            </Field>
          </div>

          {/* Host */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Host Name" required error={errors.hostName}>
              <Input value={form.hostName} onChange={(e) => updateField("hostName", e.target.value)} />
            </Field>
            <Field label="Host Contact" error={errors.hostContact}>
              <Input value={form.hostContact ?? ""} onChange={(e) => updateField("hostContact", e.target.value)} placeholder="Phone or email (optional)" />
            </Field>
          </div>

          {/* Cover Image Upload */}
          <Field label="Cover Image" required error={errors.coverImageUrl}>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
                e.target.value = "";
              }}
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload size={16} className="mr-1" />
                {uploadingCover ? "Uploading…" : "Upload Cover"}
              </Button>
              {form.coverImageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={form.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    disabled={isBusy}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5 disabled:opacity-50"
                    onClick={removeCoverImage}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </Field>

          {/* Gallery Images */}
          <Field label="Gallery Images">
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) handleGalleryUpload(files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Upload size={16} className="mr-1" />
              {uploadingGallery ? "Uploading…" : "Add Image"}
            </Button>
            {(form.imageAssets ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.imageAssets ?? []).map((asset, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={asset.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isBusy}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5 disabled:opacity-50"
                      onClick={() => removeGalleryImage(idx)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {/* Metrics (dynamic list) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Metrics</label>
              <Button type="button" variant="ghost" size="sm" onClick={addMetric}>
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
            {(form.metrics ?? []).map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Label (e.g. Women Trained)"
                  value={m.label}
                  onChange={(e) => updateMetric(idx, "label", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g. 120)"
                  value={m.value}
                  onChange={(e) => updateMetric(idx, "value", e.target.value)}
                  className="w-24"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMetric(idx)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Testimonials (dynamic list) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Testimonials</label>
              <Button type="button" variant="ghost" size="sm" onClick={addTestimonial}>
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
            {(form.testimonials ?? []).map((t, idx) => (
              <div key={idx} className="flex flex-col gap-2 border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Testimonial #{idx + 1}</label>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTestimonial(idx)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
                <Input
                  placeholder="Name (e.g. Sunita Devi, Participant)"
                  value={t.username}
                  onChange={(e) => updateTestimonial(idx, "username", e.target.value)}
                />
                <Textarea
                  placeholder="Quote text…"
                  value={t.description}
                  onChange={(e) => updateTestimonial(idx, "description", e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isBusy} className="gradient-warm text-primary-foreground">
              {editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;

// ---------- Tiny sub-components ----------

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function DatePicker({
  date,
  onSelect,
}: {
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
