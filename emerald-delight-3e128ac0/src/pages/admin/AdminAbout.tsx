import { useEffect, useState } from "react";
import { Save, Loader2, Eye, Target, Heart, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { aboutApi, About } from "@/services/about.services";

const PAGE_TITLE = "Manage About Page";

const defaultAbout: About = {
  _id: "",
  heroTitle: "About The Summit LLP",
  heroSubtitle: "Pioneering healthcare quality and sustainability across India and beyond.",
  whoWeAreTitle: "Who We Are",
  whoWeAreContent: "",
  problemTitle: "The Problem in Indian Healthcare",
  problemContent: "",
  vision: "",
  mission: "",
  values: "",
  createdAt: "",
  updatedAt: "",
};

const AdminAbout = () => {
  const [about, setAbout] = useState<About>(defaultAbout);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero" | "content" | "vision">("hero");

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  // Fetch about data from API
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await aboutApi.get();
        if (response.success && response.data) {
          setAbout(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch about data:", error);
        toast.error("Failed to load about page data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await aboutApi.update({
        heroTitle: about.heroTitle,
        heroSubtitle: about.heroSubtitle,
        whoWeAreTitle: about.whoWeAreTitle,
        whoWeAreContent: about.whoWeAreContent,
        problemTitle: about.problemTitle,
        problemContent: about.problemContent,
        vision: about.vision,
        mission: about.mission,
        values: about.values,
      });
      
      if (response.success) {
        setAbout(response.data);
        toast.success("About page content updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save about data:", error);
      toast.error("Failed to save about page content");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow";

  const textareaClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow resize-none";

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
          <h1 className="font-serif text-3xl font-bold text-foreground">About Page</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your about page content</p>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-1">
        {[
          { id: "hero", label: "Hero Section", icon: Eye },
          { id: "content", label: "Content", icon: Info },
          { id: "vision", label: "Vision & Mission", icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "text-gold border-b-2 border-gold bg-gold/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {/* Hero Section */}
        {activeTab === "hero" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Eye className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-lg font-bold text-foreground">Hero Section</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Hero Title <span className="text-destructive">*</span>
                </label>
                <input 
                  className={inputClass} 
                  value={about.heroTitle} 
                  onChange={(e) => setAbout({ ...about, heroTitle: e.target.value })} 
                  placeholder="e.g., About The Summit LLP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Hero Subtitle <span className="text-destructive">*</span>
                </label>
                <textarea 
                  rows={3}
                  className={textareaClass} 
                  value={about.heroSubtitle} 
                  onChange={(e) => setAbout({ ...about, heroSubtitle: e.target.value })} 
                  placeholder="Brief subtitle for the hero section"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Who We Are */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Info className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-bold text-foreground">Who We Are</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Section Title <span className="text-destructive">*</span>
                  </label>
                  <input 
                    className={inputClass} 
                    value={about.whoWeAreTitle} 
                    onChange={(e) => setAbout({ ...about, whoWeAreTitle: e.target.value })} 
                    placeholder="e.g., Who We Are"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Content <span className="text-destructive">*</span>
                  </label>
                  <textarea 
                    rows={6}
                    className={textareaClass} 
                    value={about.whoWeAreContent} 
                    onChange={(e) => setAbout({ ...about, whoWeAreContent: e.target.value })} 
                    placeholder="Describe who you are..."
                  />
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <AlertCircle className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-bold text-foreground">Problem Statement</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Section Title <span className="text-destructive">*</span>
                  </label>
                  <input 
                    className={inputClass} 
                    value={about.problemTitle} 
                    onChange={(e) => setAbout({ ...about, problemTitle: e.target.value })} 
                    placeholder="e.g., The Problem in Indian Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Content <span className="text-destructive">*</span>
                  </label>
                  <textarea 
                    rows={6}
                    className={textareaClass} 
                    value={about.problemContent} 
                    onChange={(e) => setAbout({ ...about, problemContent: e.target.value })} 
                    placeholder="Describe the problem you address..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vision & Mission */}
        {activeTab === "vision" && (
          <div className="space-y-6">
            {/* Vision */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Eye className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-bold text-foreground">Vision</h2>
              </div>
              <textarea 
                rows={5}
                className={textareaClass} 
                value={about.vision} 
                onChange={(e) => setAbout({ ...about, vision: e.target.value })} 
                placeholder="Your organization's vision..."
              />
            </div>

            {/* Mission */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Target className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-bold text-foreground">Mission</h2>
              </div>
              <textarea 
                rows={5}
                className={textareaClass} 
                value={about.mission} 
                onChange={(e) => setAbout({ ...about, mission: e.target.value })} 
                placeholder="Your organization's mission..."
              />
            </div>

            {/* Values */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Heart className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-lg font-bold text-foreground">Values</h2>
              </div>
              <textarea 
                rows={5}
                className={textareaClass} 
                value={about.values} 
                onChange={(e) => setAbout({ ...about, values: e.target.value })} 
                placeholder="Your organization's values..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAbout;
