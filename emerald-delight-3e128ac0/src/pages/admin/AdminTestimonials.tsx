import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Edit2, Quote, Loader2, Upload, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { testimonialApi, Testimonial, CreateTestimonialRequest, UpdateTestimonialRequest } from "@/services/testimonial.services";

const PAGE_TITLE = "Manage Testimonials";

interface TestimonialForm {
  _id: string;
  fullName: string;
  title: string;
  company: string;
  quote: string;
  photo: {
    public_id: string;
    url: string;
  };
  rating: number;
  isActive: boolean;
  user_image_url: string;
}

const emptyForm: TestimonialForm = {
  _id: "",
  fullName: "",
  title: "",
  company: "",
  quote: "",
  photo: { public_id: "", url: "" },
  rating: 5,
  isActive: true,
  user_image_url: "",
};

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<TestimonialForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchTestimonials();
    return () => { document.title = "The Summit"; };
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await testimonialApi.getAll();
      setTestimonials(response.data);
    } catch (error) {
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ ...emptyForm, _id: "" });
    setIsNew(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditing({
      _id: item._id,
      fullName: item.fullName,
      title: item.title,
      company: item.company,
      quote: item.quote,
      photo: item.photo || { public_id: "", url: "" },
      rating: item.rating,
      isActive: item.isActive,
      user_image_url: item.user_image_url || "",
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
    if (!editing.fullName.trim() || !editing.quote.trim()) {
      toast.error("Name and testimonial text are required.");
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        const data: CreateTestimonialRequest = {
          fullName: editing.fullName,
          title: editing.title,
          company: editing.company,
          quote: editing.quote,
          photo: editing.photo.url ? editing.photo : undefined,
          rating: editing.rating,
          isActive: editing.isActive,
          user_image_url: editing.user_image_url || undefined,
        };
        await testimonialApi.create(data);
        toast.success("Testimonial added successfully!");
      } else {
        const data: UpdateTestimonialRequest = {
          fullName: editing.fullName,
          title: editing.title,
          company: editing.company,
          quote: editing.quote,
          photo: editing.photo.url ? editing.photo : undefined,
          rating: editing.rating,
          isActive: editing.isActive,
          user_image_url: editing.user_image_url || undefined,
        };
        await testimonialApi.update(editing._id, data);
        toast.success("Testimonial updated successfully!");
      }
      setEditing(null);
      fetchTestimonials();
    } catch (error) {
      toast.error(isNew ? "Failed to create testimonial" : "Failed to update testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setLoading(true);
    try {
      await testimonialApi.toggleStatus(id);
      toast.success("Testimonial status updated");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to toggle testimonial status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    setLoading(true);
    try {
      await testimonialApi.delete(id);
      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
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
          <h1 className="font-serif text-3xl font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage testimonials displayed on the homepage</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {loading && testimonials.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No testimonials found. Click "Add Testimonial" to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item) => (
            <div key={item._id} className="bg-card rounded-lg border border-border p-5 hover:border-gold/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {item.photo?.url ? (
                    <img
                      src={item.photo.url}
                      alt={item.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={18} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Quote size={14} className="text-gold flex-shrink-0" />
                      <p className="text-sm text-foreground italic line-clamp-2">"{item.quote}"</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.fullName}</p>
                    <p className="text-xs text-muted-foreground">{item.title}{item.company && `, ${item.company}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= item.rating ? "text-gold" : "text-muted"}>★</span>
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleStatus(item._id)}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={item.isActive ? "Deactivate" : "Activate"}
                  >
                    {item.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">{isNew ? "Add Testimonial" : "Edit Testimonial"}</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X size={18} /></button>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Photo</label>
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
                <input className={inputClass} placeholder="Dr. Jane Smith" value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title / Designation</label>
                  <input className={inputClass} placeholder="Chief Medical Officer" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Company</label>
                  <input className={inputClass} placeholder="Healthcare Innovations Inc." value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Testimonial *</label>
                <textarea rows={4} className={inputClass} placeholder="Their testimonial..." value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Rating</label>
                  <select
                    className={inputClass}
                    value={editing.rating}
                    onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select
                    className={inputClass}
                    value={editing.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "active" })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">User Image URL (optional)</label>
                <input className={inputClass} placeholder="https://example.com/image.jpg" value={editing.user_image_url} onChange={(e) => setEditing({ ...editing, user_image_url: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {isNew ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
