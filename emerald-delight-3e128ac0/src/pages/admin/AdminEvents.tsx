import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, X, Edit2, Loader2, Calendar, MapPin, Clock, ExternalLink, User } from "lucide-react";
import { toast } from "sonner";
import { eventApi, Event, CreateEventRequest, UpdateEventRequest, IEventItinerary, PopulatedSpeaker } from "@/services/event.services";
import { speakerApi, Speaker } from "@/services/speaker.services";
import { eventTypeApi, EventType } from "@/services/eventType.services";

const PAGE_TITLE = "Manage Events";

const emptyItinerary: IEventItinerary = { name: "", description: "", duration: "", time: "" };

const emptyEvent: CreateEventRequest = {
  eventName: "",
  eventDate: "",
  eventTime: "",
  eventLocation: "",
  eventGoogleLink: "",
  eventDescription: "",
  eventTypeId: undefined,
  registrationFee: undefined,
  isCommonFee: false,
  eventItinerary: [],
  capacity: undefined,
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ event: CreateEventRequest | UpdateEventRequest & { _id?: string }; index: number } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchEvents();
    fetchSpeakers();
    fetchEventTypes();
    return () => { document.title = "The Summit"; };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getAll();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      const response = await speakerApi.getAll();
      setSpeakers(response.data || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await eventTypeApi.getAll();
      setEventTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  };

  const openNew = () => {
    navigate("/admin-dashboard/events/create");
  };

  const openEdit = (event: Event, index: number) => {
    navigate(`/admin-dashboard/events/edit/${event._id}`);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.event.eventName?.trim() || !editing.event.eventDate || !editing.event.eventTime) {
      toast.error("Event name, date, and time are required.");
      return;
    }

    const status = (editing.event as any).status as string | undefined;
    const statusReason = (editing.event as any).statusReason as string | undefined;
    if ((status === 'cancelled' || status === 'delayed') && !statusReason?.trim()) {
      toast.error("Reason is required when status is cancelled or delayed.");
      return;
    }

    try {
      setSaving(true);
      // Filter out empty itinerary items
      const filteredItinerary = (editing.event.eventItinerary || []).filter(
        (item) => item.name.trim() || item.time.trim()
      );
      const eventData = { ...editing.event, eventItinerary: filteredItinerary };

      if (isNew) {
        const newEvent = await eventApi.create(eventData as CreateEventRequest);
        setEvents([...events, newEvent.data]);
        toast.success("Event created successfully!");
      } else {
        const editData = eventData as UpdateEventRequest & { _id?: string };
        const { _id, ...updateData } = editData;
        const updatedEvent = await eventApi.update(_id!, updateData);
        setEvents(events.map((e, i) => (i === editing.index ? updatedEvent.data : e)));
        toast.success("Event updated successfully!");
      }
      setEditing(null);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(isNew ? "Failed to create event" : "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string, index: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventApi.delete(id);
      setEvents(events.filter((_, i) => i !== index));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const addItinerary = () => {
    if (!editing) return;
    const currentItinerary = editing.event.eventItinerary || [];
    setEditing({
      ...editing,
      event: { ...editing.event, eventItinerary: [...currentItinerary, { ...emptyItinerary }] },
    });
  };

  const updateItinerary = (idx: number, field: keyof IEventItinerary, value: string) => {
    if (!editing) return;
    const itinerary = [...(editing.event.eventItinerary || [])];
    itinerary[idx] = { ...itinerary[idx], [field]: value };
    setEditing({ ...editing, event: { ...editing.event, eventItinerary: itinerary } });
  };

  const removeItinerary = (idx: number) => {
    if (!editing) return;
    const itinerary = (editing.event.eventItinerary || []).filter((_, i) => i !== idx);
    setEditing({ ...editing, event: { ...editing.event, eventItinerary: itinerary } });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage conference events and schedules</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No events found. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={event._id} className="bg-card rounded-lg border border-border p-5 hover:border-gold/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span>{event.eventName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {(event as any).status || 'scheduled'}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gold" />
                      {formatDate(event.eventDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gold" />
                      {event.eventTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gold" />
                      {event.eventLocation}
                    </span>
                    {event.speakerId && typeof event.speakerId === 'object' && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-gold" />
                        {(event.speakerId as PopulatedSpeaker).fullName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.eventDescription}</p>
                  <div className="flex items-center gap-4">
                    {event.eventGoogleLink && (
                      <a
                        href={event.eventGoogleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> View on Google
                      </a>
                    )}
                    {event.registrationFee && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                        Prof: ₹{event.registrationFee.professional_individuals} | Stu: ₹{event.registrationFee.student_individuals} | Group/head: ₹{event.registrationFee.student_group_per_head}
                      </span>
                    )}
                    {event.isCommonFee && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Common Fee
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(event, i)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteEvent(event._id, i)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {event.eventItinerary && event.eventItinerary.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Itinerary</p>
                  <div className="grid gap-2">
                    {event.eventItinerary.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-gold font-mono text-xs w-16">{item.time}</span>
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground text-xs">({item.duration})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
