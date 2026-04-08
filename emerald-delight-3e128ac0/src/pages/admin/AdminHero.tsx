import { useEffect, useState, useRef } from "react";
import { Save, Check, Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";
import carousel1 from "@/assets/carousel-1.jpg";
import carousel2 from "@/assets/carousel-2.jpg";
import carousel3 from "@/assets/carousel-3.jpg";
import carousel4 from "@/assets/carousel-4.jpg";
import carousel5 from "@/assets/carousel-5.jpg";
import heroMedical1 from "@/assets/hero-medical-1.jpg";
import heroMedical2 from "@/assets/hero-medical-2.jpg";
import heroMedical3 from "@/assets/hero-medical-3.jpg";
import heroMedical4 from "@/assets/hero-medical-4.jpg";
import { heroApi, Hero } from "@/services/hero.services";

const PAGE_TITLE = "Manage Hero Section";

const heroImages = [
  { id: "hero-bg", src: heroBg, label: "Hospital Corridor" },
  { id: "hero-medical-1", src: heroMedical1, label: "Conference Hall" },
  { id: "hero-medical-2", src: heroMedical2, label: "Surgery Room" },
  { id: "hero-medical-3", src: heroMedical3, label: "Hospital Lobby" },
  { id: "hero-medical-4", src: heroMedical4, label: "Research Lab" },
  { id: "carousel-1", src: carousel1, label: "Auditorium" },
  { id: "carousel-2", src: carousel2, label: "Keynote" },
  { id: "carousel-3", src: carousel3, label: "Networking" },
  { id: "carousel-4", src: carousel4, label: "Exhibition" },
  { id: "carousel-5", src: carousel5, label: "Panel" },
];

const defaultHero: Hero = {
  _id: "",
  topSubtitle: "The Summit LLP Presents",
  mainTitle: "Healthcare Quality",
  titleHighlight: "& Sustainability",
  description: "A premier conference bringing together global healthcare leaders, quality experts, and innovators.",
  tagline: "Founded by Harvard-certified healthcare quality professional",
  participationCount: 150,
  eventsCount: 0,
  carousel: [],
  backgroundImage: { public_id: "", url: "" },
  updatedAt: "",
};

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const AdminHero = () => {
  const [hero, setHero] = useState<Hero>(defaultHero);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  // Fetch hero data from API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await heroApi.get();
        if (response.success && response.data) {
          setHero(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
        toast.error("Failed to load hero data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP formats are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be under 5MB.");
      return;
    }

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setHero(prev => ({
          ...prev,
          backgroundImage: {
            public_id: result.data.public_id,
            url: result.data.secure_url,
          }
        }));
        toast.success("Image uploaded successfully!");
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackgroundImage = () => {
    setHero(prev => ({
      ...prev,
      backgroundImage: { public_id: "", url: "" }
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP formats are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setHero(prev => ({
          ...prev,
          carousel: [...prev.carousel, { image: result.data.secure_url }]
        }));
        toast.success("Carousel image added successfully!");
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (carouselInputRef.current) carouselInputRef.current.value = "";
    }
  };

  const removeCarouselImage = (index: number) => {
    setHero(prev => ({
      ...prev,
      carousel: prev.carousel.filter((_, i) => i !== index)
    }));
    toast.success("Carousel image removed");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await heroApi.update({
        topSubtitle: hero.topSubtitle,
        mainTitle: hero.mainTitle,
        titleHighlight: hero.titleHighlight,
        description: hero.description,
        tagline: hero.tagline,
        participationCount: hero.participationCount,
        eventsCount: hero.eventsCount,
        carousel: hero.carousel,
        backgroundImage: hero.backgroundImage,
      });
      
      if (response.success) {
        setHero(response.data);
        toast.success("Hero section updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save hero data:", error);
      toast.error("Failed to save hero data");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow";

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Hero Section</h1>
          <p className="text-muted-foreground text-sm mt-1">Edit the homepage hero content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Text Content */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3">Text Content</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Top Subtitle</label>
            <input className={inputClass} value={hero.topSubtitle} onChange={(e) => setHero({ ...hero, topSubtitle: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Main Title</label>
            <input className={inputClass} value={hero.mainTitle} onChange={(e) => setHero({ ...hero, mainTitle: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title Highlight (gold text)</label>
            <input className={inputClass} value={hero.titleHighlight} onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea rows={3} className={inputClass} value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tagline</label>
            <input className={inputClass} value={hero.tagline} onChange={(e) => setHero({ ...hero, tagline: e.target.value })} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Participant Count</label>
              <input 
                type="number" 
                className={inputClass} 
                value={hero.participationCount} 
                onChange={(e) => setHero({ ...hero, participationCount: parseInt(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Events Count</label>
              <input 
                type="number" 
                className={inputClass} 
                value={hero.eventsCount} 
                onChange={(e) => setHero({ ...hero, eventsCount: parseInt(e.target.value) || 0 })} 
              />
            </div>
          </div>
        </div>

        {/* Carousel Images */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3">Carousel Images</h2>
          
          {/* Upload section */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-gold/40 transition-colors">
            <div className="text-center">
              <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Add Carousel Image</p>
              <p className="text-xs text-muted-foreground mb-3">
                Click to browse or drag & drop your image
              </p>
              <div className="inline-flex flex-col items-center gap-1 bg-muted/50 rounded-lg px-4 py-2.5 mb-4">
                <p className="text-xs font-semibold text-foreground">Image Requirements</p>
                <p className="text-[11px] text-muted-foreground">Max size: <span className="font-medium text-foreground">5MB</span></p>
                <p className="text-[11px] text-muted-foreground">Formats: <span className="font-medium text-foreground">JPG, PNG, WebP</span></p>
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {isUploading ? "Uploading..." : "Add Image"}
                  <input
                    ref={carouselInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCarouselUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Carousel Images Grid */}
          {hero.carousel.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-foreground mb-3">Carousel Images ({hero.carousel.length}):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {hero.carousel.map((item, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img src={item.image} alt={`Carousel ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeCarouselImage(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Image */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3">Background Image</h2>

          {/* Upload section */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 hover:border-gold/40 transition-colors">
            <div className="text-center">
              <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Upload Background Image</p>
              <p className="text-xs text-muted-foreground mb-3">
                Click to browse or drag & drop your image
              </p>
              <div className="inline-flex flex-col items-center gap-1 bg-muted/50 rounded-lg px-4 py-2.5 mb-4">
                <p className="text-xs font-semibold text-foreground">Image Requirements</p>
                <p className="text-[11px] text-muted-foreground">Max size: <span className="font-medium text-foreground">5MB</span></p>
                <p className="text-[11px] text-muted-foreground">Formats: <span className="font-medium text-foreground">JPG, PNG, WebP</span></p>
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {isUploading ? "Uploading..." : "Choose File"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {uploadError}
              </div>
            )}

            {hero.backgroundImage.url && (
              <div className="mt-4 relative">
                <p className="text-xs font-medium text-foreground mb-2">Current Background Image:</p>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={hero.backgroundImage.url} alt="Background" className="w-full h-full object-cover" />
                  <button
                    onClick={removeBackgroundImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-white hover:bg-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute top-2 left-2 bg-gold rounded-full p-1">
                    <Check size={12} className="text-emerald-dark" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
