import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEventStore } from "@/stores/eventStore";
import { EventStatus, type Event } from "@/types/firebase";
import { format } from "date-fns";
import EventFormDialog from "@/components/admin/EventFormDialog";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, LogOut, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FilterType = "all" | "upcoming" | "past";

const statusLabel: Record<EventStatus, string> = {
  [EventStatus.FILLING_FAST]: "Filling Fast",
  [EventStatus.ONLINE]: "Online",
  [EventStatus.REGISTRATION_CLOSED]: "Registration Closed",
  [EventStatus.COMPLETED]: "Completed",
};

function isUpcoming(e: Event) {
  return e.status !== EventStatus.COMPLETED;
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const allEvents = useEventStore((s) => s.events);
  const loading = useEventStore((s) => s.loading);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const addEvent = useEventStore((s) => s.addEvent);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const deleteEvent = useEventStore((s) => s.deleteEvent);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const filteredEvents = useMemo(() => {
    if (filterType === "all") return allEvents;
    return allEvents.filter((e) => (filterType === "upcoming" ? isUpcoming(e) : !isUpcoming(e)));
  }, [allEvents, filterType]);

  const openCreate = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleSave = async (data: Omit<Event, "id" | "createdAt" | "updatedAt">, editingId: string | null) => {
    if (editingId) {
      const success = await updateEvent(editingId, data);
      if (success) {
        toast({ title: "Event Updated", description: `"${data.title}" has been updated.` });
        setDialogOpen(false);
      } else {
        toast({ title: "Update Failed", description: "There was an error updating the event.", variant: "destructive" });
      }
    } else {
      const success = await addEvent(data);
      if (success) {
        toast({ title: "Event Created", description: `"${data.title}" has been added.` });
        setDialogOpen(false);
      } else {
        toast({ title: "Creation Failed", description: "There was an error creating the event.", variant: "destructive" });
      }
    }
  };

  const confirmDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (eventToDelete) {
      const success = await deleteEvent(eventToDelete.id);
      if (success) {
        toast({ title: "Event Deleted", description: `"${eventToDelete.title}" has been removed.` });
      } else {
        toast({ title: "Deletion Failed", description: "There was an error deleting the event.", variant: "destructive" });
      }
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading events...</div>;
  }

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
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Event Management</h1>
          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
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
                <TableHead className="hidden md:table-cell">Start</TableHead>
                <TableHead className="hidden lg:table-cell">Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No events found. Create your first event!
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {format(new Date(event.startDateTime), "dd MMM yyyy, h:mm a")}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {event.venueName || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          event.status === EventStatus.FILLING_FAST
                            ? "bg-accent/20 text-accent-foreground"
                            : event.status === EventStatus.ONLINE
                            ? "bg-secondary/20 text-secondary"
                            : event.status === EventStatus.COMPLETED
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusLabel[event.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(event)}>
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

      {/* Form Dialog */}
      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingEvent={editingEvent}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
