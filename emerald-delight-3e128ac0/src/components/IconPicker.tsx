import { useEffect, useState, useRef } from "react";
import { Image, Upload, X, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  emailIconApi,
  EmailIcon,
  EmailIconCategory,
} from "@/services/emailIcon.services";

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, width?: number, height?: number) => void;
}

const categoryLabels: Record<EmailIconCategory, string> = {
  logo: "Logos",
  social: "Social Icons",
  icon: "Icons",
  custom: "Custom",
};

const IconPicker: React.FC<IconPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [icons, setIcons] = useState<EmailIcon[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmailIconCategory | "all">("all");
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    name: "",
    category: "custom" as EmailIconCategory,
    width: 100,
    height: 100,
  });

  useEffect(() => {
    if (isOpen) {
      fetchIcons();
    }
  }, [isOpen]);

  const fetchIcons = async () => {
    try {
      setLoading(true);
      const response = await emailIconApi.getAll(
        selectedCategory === "all" ? undefined : selectedCategory
      );
      setIcons(response.data || []);
    } catch (error) {
      console.error("Error fetching icons:", error);
      toast.error("Failed to load icons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchIcons();
    }
  }, [selectedCategory, isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadForm.name.trim()) {
      toast.error("Please enter a name for the icon");
      return;
    }

    try {
      setUploading(true);
      await emailIconApi.upload({
        file,
        name: uploadForm.name,
        category: uploadForm.category,
        width: uploadForm.width,
        height: uploadForm.height,
      });
      toast.success("Icon uploaded successfully");
      setShowUpload(false);
      setUploadForm({ name: "", category: "custom", width: 100, height: 100 });
      fetchIcons();
    } catch (error) {
      console.error("Error uploading icon:", error);
      toast.error("Failed to upload icon");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteIcon = async (icon: EmailIcon) => {
    if (!confirm(`Delete "${icon.name}"?`)) return;

    try {
      await emailIconApi.delete(icon._id);
      toast.success("Icon deleted successfully");
      fetchIcons();
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast.error("Failed to delete icon");
    }
  };

  const handleSelectIcon = (icon: EmailIcon) => {
    onSelect(icon.url, icon.width, icon.height);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border border-border max-w-3xl w-full p-6 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-bold text-foreground">
            Select Icon / Image
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-gold text-emerald-dark"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {(["logo", "social", "icon", "custom"] as EmailIconCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-gold text-emerald-dark"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            )
          )}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium gradient-gold text-emerald-dark flex items-center gap-1"
          >
            <Plus size={14} /> Upload New
          </button>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-sm mb-3">Upload New Icon</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Name *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, name: e.target.value })
                  }
                  placeholder="Icon name"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Category</label>
                <select
                  className={inputClass}
                  value={uploadForm.category}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      category: e.target.value as EmailIconCategory,
                    })
                  }
                >
                  <option value="logo">Logo</option>
                  <option value="social">Social</option>
                  <option value="icon">Icon</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Width (px)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={uploadForm.width}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      width: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Height (px)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={uploadForm.height}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      height: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-gold cursor-pointer transition-colors">
                {uploading ? (
                  <Loader2 size={18} className="animate-spin text-gold" />
                ) : (
                  <Upload size={18} className="text-muted-foreground" />
                )}
                <span className="text-sm">
                  {uploading ? "Uploading..." : "Choose File"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        )}

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : icons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image size={48} className="mx-auto mb-3 opacity-30" />
              <p>No icons found</p>
              <p className="text-sm mt-1">Upload icons to use in email templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {icons.map((icon) => (
                <div
                  key={icon._id}
                  className="relative group bg-muted rounded-lg p-3 flex flex-col items-center justify-center aspect-square cursor-pointer hover:ring-2 hover:ring-gold transition-all"
                  onClick={() => handleSelectIcon(icon)}
                >
                  <img
                    src={icon.url}
                    alt={icon.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ width: icon.width || 60, height: icon.height || 60 }}
                  />
                  <span className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
                    {icon.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIcon(icon);
                    }}
                    className="absolute top-1 right-1 p-1 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
          Click on an icon to insert it into your email template
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
