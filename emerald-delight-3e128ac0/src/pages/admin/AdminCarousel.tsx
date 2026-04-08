import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, GripVertical, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { heroApi, CarouselItem } from "@/services/hero.services";
import { uploadApi } from "@/services/upload.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_TITLE = "Manage Carousel";

// Image resolution criteria
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 675;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

type SlideItem = { id: string; src: string; caption: string };

const AdminCarousel = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    fetchCarouselData();
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  const fetchCarouselData = async () => {
    try {
      setLoading(true);
      const response = await heroApi.get();
      if (response.success) {
        const carouselSlides = response.data.carousel.map((item, index) => ({
          id: `slide-${index}`,
          src: item.image,
          caption: `Carousel Image ${index + 1}`,
        }));
        setSlides(carouselSlides);
      }
    } catch (error) {
      toast.error("Failed to load carousel data");
    } finally {
      setLoading(false);
    }
  };

  const saveCarousel = async (updatedSlides: SlideItem[]) => {
    try {
      setSaving(true);
      const carousel: CarouselItem[] = updatedSlides.map((slide) => ({
        image: slide.src,
      }));
      await heroApi.update({ carousel });
      toast.success("Carousel updated successfully!");
    } catch (error) {
      toast.error("Failed to save carousel");
    } finally {
      setSaving(false);
    }
  };

  const updateCaption = (id: string, caption: string) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, caption } : s)));
  };

  const deleteSlide = async (id: string) => {
    const updatedSlides = slides.filter((s) => s.id !== id);
    setSlides(updatedSlides);
    await saveCarousel(updatedSlides);
  };

  const handleSaveCaption = () => {
    setEditingId(null);
    saveCarousel(slides);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP formats are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setPreviewUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const checkResolutionCriteria = () => {
    if (!imageDimensions) return null;
    
    const { width, height } = imageDimensions;
    const issues = [];
    
    if (width < MIN_WIDTH) issues.push(`Width is too small (${width}px). Minimum: ${MIN_WIDTH}px`);
    if (width > MAX_WIDTH) issues.push(`Width is too large (${width}px). Maximum: ${MAX_WIDTH}px`);
    if (height < MIN_HEIGHT) issues.push(`Height is too small (${height}px). Minimum: ${MIN_HEIGHT}px`);
    if (height > MAX_HEIGHT) issues.push(`Height is too large (${height}px). Maximum: ${MAX_HEIGHT}px`);
    
    return issues.length > 0 ? issues : null;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const criteriaIssues = checkResolutionCriteria();
    if (criteriaIssues) {
      console.log("Image resolution warnings:", criteriaIssues);
    }

    setIsUploading(true);
    
    try {
      const uploadResult = await uploadApi.uploadImage(selectedFile);
      const imageUrl = uploadResult.secure_url;
      
      const newSlide: SlideItem = {
        id: `slide-${Date.now()}`,
        src: imageUrl,
        caption: "New Carousel Image",
      };
      
      const updatedSlides = [...slides, newSlide];
      setSlides(updatedSlides);
      await saveCarousel(updatedSlides);
      closeModal();
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Carousel Images</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage homepage carousel slides</p>
        </div>
        <button 
          onClick={openModal}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus size={16} /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-card rounded-xl border border-border overflow-hidden group hover:border-gold/30 transition-colors"
          >
            <div className="relative aspect-video">
              <img src={slide.src} alt={slide.caption} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => deleteSlide(slide.id)}
                  disabled={saving}
                  className="p-2 rounded-full bg-destructive/80 text-white hover:bg-destructive transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <GripVertical size={16} className="text-white/50" />
              </div>
            </div>
            <div className="p-4">
              {editingId === slide.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
                    value={slide.caption}
                    onChange={(e) => updateCaption(slide.id, e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCaption}
                    disabled={saving}
                    className="w-full py-2 rounded-lg gradient-gold text-emerald-dark text-xs font-semibold disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : (
                <p
                  className="text-sm text-foreground cursor-pointer hover:text-gold transition-colors"
                  onClick={() => setEditingId(slide.id)}
                >
                  {slide.caption}
                  <span className="text-xs text-muted-foreground ml-2">(click to edit)</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No carousel images yet. Add your first image!</p>
        </div>
      )}

      {/* Add Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add Carousel Image</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Upload an image for the homepage carousel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Resolution Criteria Info */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                <ImageIcon size={14} className="text-gold" />
                Recommended Resolution
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="text-foreground">Min Width:</span> {MIN_WIDTH}px
                </div>
                <div>
                  <span className="text-foreground">Max Width:</span> {MAX_WIDTH}px
                </div>
                <div>
                  <span className="text-foreground">Min Height:</span> {MIN_HEIGHT}px
                </div>
                <div>
                  <span className="text-foreground">Max Height:</span> {MAX_HEIGHT}px
                </div>
              </div>
            </div>

            {/* Upload Area */}
            {!previewUrl ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 hover:border-gold/40 transition-colors">
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    JPG, PNG, WebP up to 5MB
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <Upload size={14} />
                    Choose File
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setImageDimensions(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-white hover:bg-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Image Info */}
                {imageDimensions && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Dimensions: <span className="text-foreground">{imageDimensions.width} x {imageDimensions.height}px</span>
                    </span>
                    {checkResolutionCriteria() ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        ⚠ Does not meet criteria
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        ✓ Meets criteria
                      </span>
                    )}
                  </div>
                )}

                {/* Criteria Issues Warning */}
                {checkResolutionCriteria() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-700 mb-1">⚠ Resolution Warnings:</p>
                    <ul className="text-xs text-amber-600 space-y-1">
                      {checkResolutionCriteria()?.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-amber-600 mt-2 italic">You can still upload this image.</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-dark/30 border-t-emerald-dark rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Add Image
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarousel;
