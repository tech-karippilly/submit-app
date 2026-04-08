import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { eventTypeApi, EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from "@/services/eventType.services";

const PAGE_TITLE = "Manage Event Types";

const emptyType: CreateEventTypeRequest = {
  name: "",
  description: "",
};

const AdminEventTypes = () => {
  const [types, setTypes] = useState<EventType[]>([]);
  const [editing, setEditing] = useState<(CreateEventTypeRequest & { _id?: string }) | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchTypes();
    return () => {
      document.title = "The Summit";
    };
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await eventTypeApi.getAll();
      setTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching event types:", error);
      toast.error("Failed to load event types");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ ...emptyType });
    setIsNew(true);
  };

  const openEdit = (type: EventType) => {
    setEditing({ _id: type._id, name: type.name, description: type.description || "" });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing?.name.trim()) {
      toast.error("Type name is required.");
      return;
    }

    try {
      setLoading(true);
      if (isNew) {
        await eventTypeApi.create({ name: editing.name, description: editing.description || undefined });
        toast.success("Event type created successfully");
      } else if (editing._id) {
        await eventTypeApi.update(editing._id, { name: editing.name, description: editing.description || undefined });
        toast.success("Event type updated successfully");
      }
      setEditing(null);
      fetchTypes();
    } catch (error) {
      console.error("Error saving event type:", error);
      toast.error(isNew ? "Failed to create event type" : "Failed to update event type");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event type?")) return;

    try {
      setLoading(true);
      await eventTypeApi.delete(id);
      toast.success("Event type deleted successfully");
      fetchTypes();
    } catch (error) {
      console.error("Error deleting event type:", error);
      toast.error("Failed to delete event type");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Event Types</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage master list of event types (e.g. Conference, Seminar, Summit).</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Type
        </button>
      </div>

      {loading && types.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No event types found. Click "Add Type" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {types.map((type) => (
            <div key={type._id} className="bg-card rounded-xl border border-border p-5 flex justify-between items-start">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">{type.name}</h3>
                {type.description && (
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(type)}
                  className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(type._id)}
                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-card rounded-xl border border-border max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">
                {isNew ? "Add Event Type" : "Edit Event Type"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                <input
                  className={inputClass}
                  placeholder="Conference"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Optional description for this type"
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {isNew ? "Add Type" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventTypes;
