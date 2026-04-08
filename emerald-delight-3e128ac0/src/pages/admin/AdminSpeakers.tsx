import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { speakerApi, Speaker, CreateSpeakerRequest, UpdateSpeakerRequest } from "@/services/speaker.services";

const PAGE_TITLE = "Manage Speakers";

interface SpeakerForm {
  _id: string;
  fullName: string;
  title: string;
  organization: string;
  topic?: string;
  bio: string;
  photo: {
    public_id: string;
    url: string;
  };
}

const emptyForm: SpeakerForm = {
  _id: "",
  fullName: "",
  title: "",
  organization: "",
  topic: "",
  bio: "",
  photo: { public_id: "", url: "" },
};

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const AdminSpeakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [editing, setEditing] = useState<SpeakerForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchSpeakers();
    return () => { document.title = "The Summit"; };
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const response = await speakerApi.getAll();
      setSpeakers(response.data);
    } catch (error) {
      toast.error("Failed to fetch speakers");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ ...emptyForm, _id: "" });
    setIsNew(true);
  };

  const openEdit = (speaker: Speaker) => {
    setEditing({
      _id: speaker._id,
      fullName: speaker.fullName,
      title: speaker.title,
      organization: speaker.organization,
      topic: speaker.topic,
      bio: speaker.bio,
      photo: speaker.photo || { public_id: "", url: "" },
    });
    setIsNew(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setEditing({
          ...editing,
          photo: {
            public_id: result.data.public_id,
            url: result.data.secure_url,
          },
        });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.fullName.trim()) {
      toast.error("Name is required.");
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        const data: CreateSpeakerRequest = {
          fullName: editing.fullName,
          title: editing.title,
          organization: editing.organization,
          bio: editing.bio,
          photo: editing.photo.url ? editing.photo : undefined,
        };
        await speakerApi.create(data);
        toast.success("Speaker added successfully!");
      } else {
        const data: UpdateSpeakerRequest = {
          fullName: editing.fullName,
          title: editing.title,
          organization: editing.organization,
          topic: editing.topic,
          bio: editing.bio,
          photo: editing.photo.url ? editing.photo : undefined,
        };
        await speakerApi.update(editing._id, data);
        toast.success("Speaker updated successfully!");
      }
      setEditing(null);
      fetchSpeakers();
    } catch (error) {
      toast.error(isNew ? "Failed to create speaker" : "Failed to update speaker");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return;

    setLoading(true);
    try {
      await speakerApi.delete(id);
      toast.success("Speaker deleted successfully");
      fetchSpeakers();
    } catch (error) {
      toast.error("Failed to delete speaker");
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
          <h1 className="font-serif text-3xl font-bold text-foreground">Speakers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage conference speakers</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Speaker
        </button>
      </div>

      {loading && speakers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : speakers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No speakers found. Click "Add Speaker" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {speakers.map((speaker) => (
            <div
              key={speaker._id}
              className="bg-card rounded-xl border border-border p-5 hover:border-gold/30 transition-colors"
            >
              <div className="flex items-start gap-4 mb-3">
                {speaker.photo?.url ? (
                  <img
                    src={speaker.photo.url}
                    alt={speaker.fullName}
                    className="w-14 h-14 rounded-full object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-foreground">{speaker.fullName}</h3>
                      <p className="text-sm text-gold">{speaker.title}</p>
                      <p className="text-xs text-muted-foreground">{speaker.organization}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(speaker)}
                        className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(speaker._id)}
                        className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2 mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Topic</p>
                <p className="text-sm text-foreground font-medium">{speaker.topic}</p>
              </div>
              <p className="text-sm text-muted-foreground">{speaker.bio}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-card rounded-xl border border-border max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">
                {isNew ? "Add Speaker" : "Edit Speaker"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Speaker Photo</label>
              <div className="flex items-center gap-4">
                {editing.photo?.url ? (
                  <img
                    src={editing.photo.url}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon size={20} className="text-muted-foreground" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {uploadingImage ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={15} /> Upload
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                {editing.photo?.url && (
                  <button
                    onClick={() => setEditing({ ...editing, photo: { public_id: "", url: "" } })}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                <input
                  className={inputClass}
                  placeholder="Dr. Jane Smith"
                  value={editing.fullName}
                  onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title / Designation</label>
                  <input
                    className={inputClass}
                    placeholder="Chief Quality Officer"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Organization</label>
                  <input
                    className={inputClass}
                    placeholder="Apollo Hospitals"
                    value={editing.organization}
                    onChange={(e) => setEditing({ ...editing, organization: e.target.value })}
                  />
                </div>
              </div>
              {!isNew && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Topic</label>
                  <input
                    className={inputClass}
                    placeholder="Patient Safety & Global Standards"
                    value={editing.topic || ""}
                    onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Bio</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Brief biography..."
                  value={editing.bio}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
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
                {isNew ? "Add Speaker" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpeakers;
