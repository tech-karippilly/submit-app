import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { founderApi, Founder } from "@/services/founder.services";

const PAGE_TITLE = "Manage Founders";

const AdminFounder = () => {
  const navigate = useNavigate();
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"Founder" | "CoFounder">("Founder");

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    fetchFounders();
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  const fetchFounders = async () => {
    setLoading(true);
    try {
      const response = await founderApi.getAll();
      setFounders(response.data);
    } catch (error) {
      toast.error("Failed to fetch founders");
    } finally {
      setLoading(false);
    }
  };

  const founder = founders.find((f) => f.type === "Founder");
  const cofounder = founders.find((f) => f.type === "CoFounder");

  const handleDelete = async (id: string, type: "Founder" | "CoFounder") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setLoading(true);
    try {
      await founderApi.delete(id);
      toast.success(`${type} deleted successfully`);
      fetchFounders();
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFounderCard = (f: Founder | undefined, type: "Founder" | "CoFounder") => {
    if (!f) {
      return (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <ImageIcon size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No {type} added yet</p>
          <button
            onClick={() => navigate(`/admin-dashboard/founder/create?type=${type}`)}
            className="px-4 py-2 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Add {type}
          </button>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-xl border border-border p-5 hover:border-gold/30 transition-colors">
        <div className="flex items-start gap-4 mb-4">
          {f.profileImage?.url ? (
            <img
              src={f.profileImage.url}
              alt={f.fullName}
              className="w-16 h-16 rounded-full object-cover border border-border flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">{f.fullName}</h3>
                <p className="text-sm text-gold">{f.title}</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => navigate(`/admin-dashboard/founder/edit/${f._id}`)}
                  className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(f._id, f.type)}
                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground line-clamp-2">{f.professionalSummary}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Hospital</p>
              <p className="text-foreground font-medium truncate">{f.hospital || "N/A"}</p>
            </div>
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Education</p>
              <p className="text-foreground font-medium truncate">{f.education?.[0] || "N/A"}</p>
            </div>
          </div>

          {f.experience && f.experience.length > 0 && (
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{f.experience.length} entries</span>
                {f.experience.some((e) => e.experienceCertificateImageUrl) && (
                  <span className="text-xs text-gold">✦ Has certificates</span>
                )}
              </div>
            </div>
          )}

          {f.certifications && f.certifications.length > 0 && (
            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Certifications</p>
              <div className="flex items-center gap-2">
                <span className="text-foreground">{f.certifications.length} entries</span>
                {f.certifications.some((c) => c.certificateImage) && (
                  <span className="text-xs text-gold">✦ Has certificates</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Founders</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage founder and co-founder profiles</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-border mb-8">
        <button
          onClick={() => setActiveTab("Founder")}
          className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
            activeTab === "Founder"
              ? "gradient-gold text-emerald-dark"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Founder
        </button>
        <button
          onClick={() => setActiveTab("CoFounder")}
          className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
            activeTab === "CoFounder"
              ? "gradient-gold text-emerald-dark"
              : "bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Co-Founder
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "Founder" && renderFounderCard(founder, "Founder")}
          {activeTab === "CoFounder" && renderFounderCard(cofounder, "CoFounder")}
        </div>
      )}
    </div>
  );
};

export default AdminFounder;
