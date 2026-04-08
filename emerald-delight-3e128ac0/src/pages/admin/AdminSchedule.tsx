import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Edit2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const PAGE_TITLE = "Manage Schedule";

type ScheduleEvent = {
  time: string;
  title: string;
  speaker: string;
  venue: string;
  type: "keynote" | "session" | "break";
};

const defaultSchedule: ScheduleEvent[] = [
  { time: "09:00 AM", title: "Registration & Welcome Coffee", speaker: "", venue: "Main Lobby", type: "break" },
  { time: "09:30 AM", title: "Opening Ceremony & Keynote Address", speaker: "Dr. Rajesh Kumar", venue: "Grand Hall", type: "keynote" },
  { time: "10:30 AM", title: "Patient Safety & Global Standards", speaker: "Speaker 1", venue: "Grand Hall", type: "session" },
  { time: "11:30 AM", title: "Networking Break", speaker: "", venue: "Exhibition Area", type: "break" },
  { time: "12:00 PM", title: "AI in Healthcare Quality", speaker: "Speaker 2", venue: "Conference Room A", type: "session" },
  { time: "01:00 PM", title: "Lunch & Exhibition", speaker: "", venue: "Banquet Hall", type: "break" },
  { time: "02:00 PM", title: "Sustainable Healthcare Systems", speaker: "Speaker 3", venue: "Grand Hall", type: "session" },
  { time: "03:30 PM", title: "Panel Discussion & Q&A", speaker: "All Speakers", venue: "Grand Hall", type: "keynote" },
  { time: "04:30 PM", title: "Closing Ceremony & Awards", speaker: "", venue: "Grand Hall", type: "keynote" },
];

const emptyEvent: ScheduleEvent = { time: "", title: "", speaker: "", venue: "", type: "session" };

const typeLabels: Record<string, string> = { keynote: "Keynote", session: "Session", break: "Break" };
const typeBadge: Record<string, string> = {
  keynote: "bg-gold/20 text-gold",
  session: "bg-primary/20 text-primary",
  break: "bg-muted text-muted-foreground",
};

const AdminSchedule = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem("summit-schedule");
    return saved ? JSON.parse(saved) : defaultSchedule;
  });
  const [editing, setEditing] = useState<{ event: ScheduleEvent; index: number } | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => { document.title = "The Summit"; };
  }, []);

  const openNew = () => {
    setEditing({ event: { ...emptyEvent }, index: -1 });
    setIsNew(true);
  };

  const openEdit = (event: ScheduleEvent, index: number) => {
    setEditing({ event: { ...event }, index });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.event.time.trim() || !editing.event.title.trim()) {
      toast.error("Time and title are required.");
      return;
    }
    let updated: ScheduleEvent[];
    if (isNew) {
      updated = [...events, editing.event];
    } else {
      updated = events.map((e, i) => (i === editing.index ? editing.event : e));
    }
    setEvents(updated);
    localStorage.setItem("summit-schedule", JSON.stringify(updated));
    setEditing(null);
    toast.success(isNew ? "Event added!" : "Event updated!");
  };

  const deleteEvent = (index: number) => {
    const updated = events.filter((_, i) => i !== index);
    setEvents(updated);
    localStorage.setItem("summit-schedule", JSON.stringify(updated));
    toast.success("Event removed");
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Event Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage conference agenda items</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Event
        </button>
      </div>

      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 hover:border-gold/30 transition-colors">
            <div className="w-20 text-xs font-mono text-gold font-medium">{event.time}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
              {event.speaker && <p className="text-xs text-muted-foreground">{event.speaker} • {event.venue}</p>}
              {!event.speaker && event.venue && <p className="text-xs text-muted-foreground">{event.venue}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${typeBadge[event.type]}`}>{typeLabels[event.type]}</span>
            <div className="flex gap-1">
              <button onClick={() => openEdit(event, i)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Edit2 size={14} />
              </button>
              <button onClick={() => deleteEvent(i)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">{isNew ? "Add Event" : "Edit Event"}</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Time *</label>
                  <input className={inputClass} placeholder="09:00 AM" value={editing.event.time} onChange={(e) => setEditing({ ...editing, event: { ...editing.event, time: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                  <select className={inputClass} value={editing.event.type} onChange={(e) => setEditing({ ...editing, event: { ...editing.event, type: e.target.value as any } })}>
                    <option value="session">Session</option>
                    <option value="keynote">Keynote</option>
                    <option value="break">Break</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                <input className={inputClass} placeholder="Session Title" value={editing.event.title} onChange={(e) => setEditing({ ...editing, event: { ...editing.event, title: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Speaker</label>
                  <input className={inputClass} placeholder="Speaker name" value={editing.event.speaker} onChange={(e) => setEditing({ ...editing, event: { ...editing.event, speaker: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Venue</label>
                  <input className={inputClass} placeholder="Grand Hall" value={editing.event.venue} onChange={(e) => setEditing({ ...editing, event: { ...editing.event, venue: e.target.value } })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Save size={15} /> {isNew ? "Add Event" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;
