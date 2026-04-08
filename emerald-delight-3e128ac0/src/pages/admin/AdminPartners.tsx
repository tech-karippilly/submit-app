import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Save, X, Edit2, Loader2, Upload, ImageIcon, Power } from "lucide-react";
import { toast } from "sonner";
import {
  sponsorApi,
  Sponsor,
  SponsorTier,
  SponsorType,
  CreateSponsorRequest,
  UpdateSponsorRequest,
} from "@/services/sponsor.services";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const PAGE_TITLE = "Manage Sponsors & Partners";

interface SponsorForm {
  name: string;
  description: string;
  logo: {
    public_id: string;
    url: string;
  };
  tier: SponsorTier;
  type: SponsorType;
  website: string;
  isActive: boolean;
}

const emptyForm: SponsorForm = {
  name: "",
  description: "",
  logo: { public_id: "", url: "" },
  tier: "gold",
  type: "sponsor",
  website: "",
  isActive: true,
};

const tierLabels: Record<SponsorTier, string> = {
  diamond: "💎 Diamond",
  platinum: "🥈 Platinum",
  gold: "🥇 Gold",
};

const typeLabels: Record<SponsorType, string> = {
  sponsor: "Sponsor",
  partner: "Partner",
};

const AdminPartners = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ sponsor: SponsorForm; id: string | null } | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    fetchSponsors();
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const response = await sponsorApi.getAll();
      setSponsors(response.data);
    } catch (error) {
      toast.error("Failed to fetch sponsors/partners");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sponsors.filter((s) => {
    const tierMatch = filterTier === "all" || s.tier === filterTier;
    const typeMatch = filterType === "all" || s.type === filterType;
    return tierMatch && typeMatch;
  });

  const openNew = () => {
    setEditing({ sponsor: { ...emptyForm }, id: null });
    setIsNew(true);
  };

  const openEdit = (sponsor: Sponsor) => {
    setEditing({
      sponsor: {
        name: sponsor.name,
        description: sponsor.description,
        logo: sponsor.logo || { public_id: "", url: "" },
        tier: sponsor.tier,
        type: sponsor.type,
        website: sponsor.website || "",
        isActive: sponsor.isActive,
      },
      id: sponsor._id,
    });
    setIsNew(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (result.success && editing) {
        setEditing({
          ...editing,
          sponsor: {
            ...editing.sponsor,
            logo: {
              public_id: result.data.public_id,
              url: result.data.secure_url,
            },
          },
        });
        toast.success("Logo uploaded successfully");
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.sponsor.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!editing.sponsor.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    try {
      if (isNew) {
        const data: CreateSponsorRequest = {
          name: editing.sponsor.name,
          description: editing.sponsor.description,
          tier: editing.sponsor.tier,
          type: editing.sponsor.type,
          logo: editing.sponsor.logo.url ? editing.sponsor.logo : undefined,
          website: editing.sponsor.website || undefined,
          isActive: editing.sponsor.isActive,
        };
        await sponsorApi.create(data);
        toast.success("Sponsor/Partner created successfully!");
      } else if (editing.id) {
        const data: UpdateSponsorRequest = {
          name: editing.sponsor.name,
          description: editing.sponsor.description,
          tier: editing.sponsor.tier,
          type: editing.sponsor.type,
          logo: editing.sponsor.logo.url ? editing.sponsor.logo : undefined,
          website: editing.sponsor.website || undefined,
          isActive: editing.sponsor.isActive,
        };
        await sponsorApi.update(editing.id, data);
        toast.success("Sponsor/Partner updated successfully!");
      }
      setEditing(null);
      fetchSponsors();
    } catch (error) {
      toast.error("Failed to save sponsor/partner");
    }
  };

  const deleteSponsor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor/partner?")) return;

    try {
      await sponsorApi.delete(id);
      toast.success("Sponsor/Partner removed");
      fetchSponsors();
    } catch (error) {
      toast.error("Failed to delete sponsor/partner");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await sponsorApi.toggleStatus(id);
      toast.success("Status updated");
      fetchSponsors();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const tierColor: Record<SponsorTier, string> = {
    diamond: "bg-sky-400/10 text-sky-400",
    platinum: "bg-slate-300/10 text-slate-300",
    gold: "bg-gold/10 text-gold",
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Sponsors & Partners</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage sponsors and partners by tier — Diamond, Platinum, Gold
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Sponsor/Partner
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          {[
            { key: "all", label: "All Tiers" },
            { key: "diamond", label: "💎 Diamond" },
            { key: "platinum", label: "🥈 Platinum" },
            { key: "gold", label: "🥇 Gold" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTier(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterTier === t.key
                  ? "gradient-gold text-emerald-dark"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All Types" },
            { key: "sponsor", label: "Sponsor" },
            { key: "partner", label: "Partner" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterType(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === t.key
                  ? "gradient-gold text-emerald-dark"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((sponsor) => (
            <div
              key={sponsor._id}
              className={`bg-card rounded-lg border border-border p-5 flex flex-col items-center gap-3 relative group ${
                !sponsor.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex gap-1 absolute top-2 left-2">
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 ${
                    tierColor[sponsor.tier]
                  }`}
                >
                  {sponsor.tier}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                  {sponsor.type}
                </span>
              </div>
              {sponsor.logo?.url ? (
                <img
                  src={sponsor.logo.url}
                  alt={sponsor.name}
                  className="w-16 h-16 object-contain mt-4"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mt-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <p className="text-sm font-medium text-foreground text-center">{sponsor.name}</p>
              <p className="text-xs text-muted-foreground text-center line-clamp-2">
                {sponsor.description}
              </p>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleStatus(sponsor._id)}
                  className={`p-1.5 rounded-md bg-muted/80 text-muted-foreground hover:text-foreground transition-colors ${
                    sponsor.isActive ? "text-green-500" : "text-red-500"
                  }`}
                  title={sponsor.isActive ? "Deactivate" : "Activate"}
                >
                  <Power size={12} />
                </button>
                <button
                  onClick={() => openEdit(sponsor)}
                  className="p-1.5 rounded-md bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => deleteSponsor(sponsor._id)}
                  className="p-1.5 rounded-md bg-muted/80 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No sponsors or partners found. Click "Add Sponsor/Partner" to create one.
        </div>
      )}

      {/* Modal */}
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
                {isNew ? "Add Sponsor/Partner" : "Edit Sponsor/Partner"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {editing.sponsor.logo.url ? (
                    <img
                      src={editing.sponsor.logo.url}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain rounded-lg border border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border border-border">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      {uploadingImage ? "Uploading..." : "Upload Logo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name *
                </label>
                <input
                  className={inputClass}
                  placeholder="Apollo Hospitals"
                  value={editing.sponsor.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, name: e.target.value },
                    })
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description *
                </label>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-none`}
                  placeholder="Brief description about the sponsor/partner"
                  value={editing.sponsor.description}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, description: e.target.value },
                    })
                  }
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Website (optional)
                </label>
                <input
                  className={inputClass}
                  placeholder="https://example.com"
                  value={editing.sponsor.website}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, website: e.target.value },
                    })
                  }
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Type *
                </label>
                <select
                  className={inputClass}
                  value={editing.sponsor.type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, type: e.target.value as SponsorType },
                    })
                  }
                >
                  <option value="sponsor">Sponsor</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              {/* Tier */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Sponsor Tier *
                </label>
                <select
                  className={inputClass}
                  value={editing.sponsor.tier}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, tier: e.target.value as SponsorTier },
                    })
                  }
                >
                  <option value="diamond">💎 Diamond</option>
                  <option value="platinum">🥈 Platinum</option>
                  <option value="gold">🥇 Gold</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editing.sponsor.isActive}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sponsor: { ...editing.sponsor, isActive: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="isActive" className="text-sm text-foreground">
                  Active (visible on website)
                </label>
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
                className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Save size={15} /> {isNew ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
