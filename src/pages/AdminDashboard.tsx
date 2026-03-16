import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEventStore, type EventData, type EventStatus, type EventType } from "@/stores/eventStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, LogOut, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FormData = Omit<EventData, "id">;

const emptyForm: FormData = {
  title: "",
  date: "",
  time: "",
  venue: "",
  venueLink: "",
  description: "",
  status: "filling-fast",
  formLink: "",
  image: "",
  type: "upcoming",
};

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: "filling-fast", label: "Filling Fast" },
  { value: "online", label: "Online" },
  { value: "registration-closed", label: "Registration Closed" },
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [filterType, setFilterType] = useState<"all" | EventType>("all");

  const filteredEvents = filterType === "all" ? events : events.filter((e) => e.type === filterType);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (event: EventData) => {
    setEditingId(event.id);
    const { id, ...rest } = event;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date.trim()) {
      toast({ title: "Validation Error", description: "Title and Date are required.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateEvent(editingId, form);
      toast({ title: "Event Updated", description: `"${form.title}" has been updated.` });
    } else {
      addEvent(form);
      toast({ title: "Event Created", description: `"${form.title}" has been added.` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (event: EventData) => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      deleteEvent(event.id);
      toast({ title: "Event Deleted", description: `"${event.title}" has been removed.` });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="font-heading text-xl font-bold text-primary">Aagaj</span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home size={16} /> Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            Event Management
          </h1>
          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreate} className="gradient-warm text-primary-foreground">
              <Plus size={16} /> New Event
            </Button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Venue</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No events found. Create your first event!
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {event.date}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {event.venue || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          event.type === "upcoming"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {event.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          event.status === "filling-fast"
                            ? "bg-accent/20 text-accent-foreground"
                            : event.status === "online"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusOptions.find((s) => s.value === event.status)?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event)}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update event details below." : "Fill in event details to publish."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date *</label>
                <Input
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  placeholder="15th April 2026"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Time</label>
                <Input
                  value={form.time}
                  onChange={(e) => updateField("time", e.target.value)}
                  placeholder="10:00 AM – 4:00 PM"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Venue</label>
              <Input value={form.venue} onChange={(e) => updateField("venue", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Venue Map Link</label>
              <Input value={form.venueLink} onChange={(e) => updateField("venueLink", e.target.value)} placeholder="https://maps.google.com/..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v as EventType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v) => updateField("status", v as EventStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Registration Form Link</label>
              <Input value={form.formLink} onChange={(e) => updateField("formLink", e.target.value)} placeholder="https://forms.google.com/..." />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input value={form.image} onChange={(e) => updateField("image", e.target.value)} placeholder="https://..." />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gradient-warm text-primary-foreground">
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
