import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Save, X, Loader2, Calendar, MapPin, Clock, ExternalLink, User } from "lucide-react";
import { toast } from "sonner";
import { eventApi, EventStatus, CreateEventRequest, UpdateEventRequest, IEventItinerary, PopulatedSpeaker } from "@/services/event.services";
import { speakerApi, Speaker } from "@/services/speaker.services";
import { eventTypeApi, EventType } from "@/services/eventType.services";

const PAGE_TITLE_NEW = "Add Event";
const PAGE_TITLE_EDIT = "Edit Event";

const emptyItinerary: IEventItinerary = { name: "", description: "", duration: "", time: "" };

const emptyEvent: CreateEventRequest = {
  eventName: "",
  eventDate: "",
  eventTime: "",
  eventLocation: "",
  eventGoogleLink: "",
  eventDescription: "",
  topic: "",
  status: "scheduled",
  statusReason: "",
  eventTypeId: undefined as any,
  registrationFee: undefined,
  isCommonFee: false,
  eventItinerary: [],
  capacity: undefined,
};

const AdminEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateEventRequest & { _id?: string }>({ ...(emptyEvent as CreateEventRequest & { _id?: string }) });

  useEffect(() => {
    document.title = isEditing ? PAGE_TITLE_EDIT : PAGE_TITLE_NEW;
    const init = async () => {
      try {
        const [speakerRes, typeRes] = await Promise.all([
          speakerApi.getAll(),
          eventTypeApi.getAll(),
        ]);
        setSpeakers(speakerRes.data || []);
        setEventTypes(typeRes.data || []);

        if (id) {
          const res = await eventApi.getById(id);
          const event = res.data;
          const speakerIdValue = event.speakerId
            ? (typeof event.speakerId === "string" ? event.speakerId : (event.speakerId as PopulatedSpeaker)._id)
            : undefined;

          setForm({
            _id: event._id,
            eventName: event.eventName,
            eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
            eventTime: event.eventTime,
            eventLocation: event.eventLocation,
            eventGoogleLink: event.eventGoogleLink,
            eventDescription: event.eventDescription,
            topic: event.topic || "",
            status: (event as any).status as EventStatus | undefined,
            statusReason: (event as any).statusReason || "",
            eventTypeId: (event as any).eventTypeId as string | undefined,
            registrationFee: event.registrationFee,
            isCommonFee: event.isCommonFee,
            speakerId: speakerIdValue,
            eventItinerary: event.eventItinerary || [],
            capacity: event.capacity,
          } as CreateEventRequest & { _id?: string });
        }
      } catch (error) {
        console.error("Error loading event form data:", error);
        toast.error("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };

    void init();

    return () => {
      document.title = "The Summit";
    };
  }, [id, isEditing]);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  const updateField = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateItinerary = (idx: number, field: keyof IEventItinerary, value: string) => {
    const itinerary = [...(form.eventItinerary || [])];
    itinerary[idx] = { ...itinerary[idx], [field]: value };
    updateField({ eventItinerary: itinerary });
  };

  const addItinerary = () => {
    const current = form.eventItinerary || [];
    updateField({ eventItinerary: [...current, { ...emptyItinerary }] });
  };

  const removeItinerary = (idx: number) => {
    const filtered = (form.eventItinerary || []).filter((_, i) => i !== idx);
    updateField({ eventItinerary: filtered });
  };

  const handleSave = async () => {
    if (!form.eventName?.trim() || !form.eventDate || !form.eventTime) {
      toast.error("Event name, date, and time are required.");
      return;
    }

    const status = (form as any).status as EventStatus | undefined;
    const statusReason = (form as any).statusReason as string | undefined;
    if ((status === "cancelled" || status === "delayed") && !statusReason?.trim()) {
      toast.error("Reason is required when status is cancelled or delayed.");
      return;
    }

    try {
      setSaving(true);
      const filteredItinerary = (form.eventItinerary || []).filter(
        (item) => item.name.trim() || item.time.trim()
      );
      const payload: CreateEventRequest & { _id?: string } = { ...form, eventItinerary: filteredItinerary };

      if (isEditing && form._id) {
        const { _id, ...updateData } = payload;
        await eventApi.update(_id!, updateData as UpdateEventRequest);
        toast.success("Event updated successfully!");
      } else {
        await eventApi.create(payload as CreateEventRequest);
        toast.success("Event created successfully!");
      }

      navigate("/admin-dashboard/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(isEditing ? "Failed to update event" : "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">{isEditing ? "Edit Event" : "Add Event"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEditing ? "Update event details" : "Create a new event"}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin-dashboard/events")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={16} /> Cancel
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Event Name *</label>
            <input
              className={inputClass}
              placeholder="Conference Keynote"
              value={form.eventName || ""}
              onChange={(e) => updateField({ eventName: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Speaker</label>
            <select
              className={inputClass}
              value={form.speakerId || ""}
              onChange={(e) => updateField({ speakerId: e.target.value || undefined })}
            >
              <option value="">Select a speaker (optional)</option>
              {speakers.map((speaker) => (
                <option key={speaker._id} value={speaker._id}>
                  {speaker.fullName} - {speaker.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Date *</label>
            <input
              type="date"
              className={inputClass}
              value={form.eventDate || ""}
              onChange={(e) => updateField({ eventDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Time *</label>
            <input
              className={inputClass}
              placeholder="09:00 AM"
              value={form.eventTime || ""}
              onChange={(e) => updateField({ eventTime: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Location *</label>
            <input
              className={inputClass}
              placeholder="Grand Hall"
              value={form.eventLocation || ""}
              onChange={(e) => updateField({ eventLocation: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Google Maps Link</label>
            <input
              className={inputClass}
              placeholder="https://maps.google.com/..."
              value={form.eventGoogleLink || ""}
              onChange={(e) => updateField({ eventGoogleLink: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Topic</label>
            <input
              className={inputClass}
              placeholder="e.g. Quality in Healthcare"
              value={(form as any).topic || ""}
              onChange={(e) => updateField({ topic: e.target.value } as any)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description *</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="Event description..."
              value={form.eventDescription || ""}
              onChange={(e) => updateField({ eventDescription: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Event Type</label>
            <select
              className={inputClass}
              value={(form as any).eventTypeId || ""}
              onChange={(e) => updateField({ eventTypeId: e.target.value || undefined } as any)}
            >
              <option value="">Select type (optional)</option>
              {eventTypes.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Event Status</label>
            <select
              className={inputClass}
              value={(form as any).status || "scheduled"}
              onChange={(e) => updateField({ status: e.target.value as EventStatus } as any)}
            >
              <option value="scheduled">Scheduled</option>
              <option value="on_time">On Time</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Capacity (Seats)</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              placeholder="Unlimited"
              value={form.capacity || ""}
              onChange={(e) => updateField({ capacity: e.target.value ? Number(e.target.value) : undefined })}
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty for unlimited seats</p>
          </div>
          {((form as any).status === "cancelled" || (form as any).status === "delayed") && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status Reason *</label>
              <textarea
                className={`${inputClass} min-h-[60px] resize-none`}
                placeholder="Provide reason for cancellation or delay"
                value={(form as any).statusReason || ""}
                onChange={(e) => updateField({ statusReason: e.target.value } as any)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Professional Individual Fee (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              value={form.registrationFee?.professional_individuals ?? 0}
              onChange={(e) =>
                updateField({
                  registrationFee: {
                    professional_individuals: Number(e.target.value),
                    student_individuals: form.registrationFee?.student_individuals ?? 0,
                    student_group_per_head: form.registrationFee?.student_group_per_head ?? 0,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Student Individual Fee (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              value={form.registrationFee?.student_individuals ?? 0}
              onChange={(e) =>
                updateField({
                  registrationFee: {
                    professional_individuals: form.registrationFee?.professional_individuals ?? 0,
                    student_individuals: Number(e.target.value),
                    student_group_per_head: form.registrationFee?.student_group_per_head ?? 0,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Student Group Fee per Head (₹)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              value={form.registrationFee?.student_group_per_head ?? 0}
              onChange={(e) =>
                updateField({
                  registrationFee: {
                    professional_individuals: form.registrationFee?.professional_individuals ?? 0,
                    student_individuals: form.registrationFee?.student_individuals ?? 0,
                    student_group_per_head: Number(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="flex items-center gap-2 pt-6 col-span-2">
            <input
              type="checkbox"
              id="isCommonFee"
              checked={form.isCommonFee || false}
              onChange={(e) => updateField({ isCommonFee: e.target.checked })}
              className="rounded border-border"
            />
            <label htmlFor="isCommonFee" className="text-sm text-muted-foreground">
              Common Fee
            </label>
          </div>
        </div>

        {/* Itinerary Section */}
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">Itinerary</label>
            <button
              type="button"
              onClick={addItinerary}
              className="text-xs text-gold hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
          {(form.eventItinerary || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-start">
              <input
                className={`${inputClass} col-span-2`}
                placeholder="Time"
                value={item.time}
                onChange={(e) => updateItinerary(idx, "time", e.target.value)}
              />
              <input
                className={`${inputClass} col-span-3`}
                placeholder="Name"
                value={item.name}
                onChange={(e) => updateItinerary(idx, "name", e.target.value)}
              />
              <input
                className={`${inputClass} col-span-2`}
                placeholder="Duration"
                value={item.duration}
                onChange={(e) => updateItinerary(idx, "duration", e.target.value)}
              />
              <input
                className={`${inputClass} col-span-4`}
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItinerary(idx, "description", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItinerary(idx)}
                className="col-span-1 p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border mt-4">
          <button
            onClick={() => navigate("/admin-dashboard/events")}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventForm;
