import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
  locked: boolean;
}

const themes: Theme[] = [
  {
    id: "default",
    name: "Classic Emerald",
    description: "The timeless blue-emerald theme with gold accents",
    colors: {
      primary: "#1e4a6e",
      accent: "#d4a84b",
      background: "#f5f7fa",
    },
    locked: false,
  },
  {
    id: "emerald",
    name: "Forest Emerald",
    description: "A fresh green palette inspired by nature",
    colors: {
      primary: "#1e4a38",
      accent: "#c9a43c",
      background: "#f5faf7",
    },
    locked: true,
  },
  {
    id: "royal",
    name: "Royal Purple",
    description: "An elegant purple theme with pink accents",
    colors: {
      primary: "#5c2d8a",
      accent: "#d64d7a",
      background: "#f7f5fa",
    },
    locked: true,
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm orange tones with golden highlights",
    colors: {
      primary: "#a83a1f",
      accent: "#e6a817",
      background: "#faf7f5",
    },
    locked: true,
  },
];

const AdminThemes = () => {
  const [currentTheme, setCurrentTheme] = useState<string>("default");

  useEffect(() => {
    let savedTheme = localStorage.getItem("summit-theme") || "default";
    // Handle legacy 'ocean' theme value
    if (savedTheme === "ocean") {
      savedTheme = "default";
      localStorage.setItem("summit-theme", "default");
    }
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeSelect = (themeId: string, locked: boolean) => {
    if (locked) {
      toast.info("This theme is locked", {
        description: "Upgrade to unlock this premium theme!",
      });
      return;
    }

    if (themeId === currentTheme) {
      return;
    }

    setCurrentTheme(themeId);
    localStorage.setItem("summit-theme", themeId);

    if (themeId === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeId);
    }

    toast.success("Theme applied!", {
      description: `You are now using the ${themes.find((t) => t.id === themeId)?.name} theme.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Theme Settings
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Customize the appearance of your site by selecting a theme. Only the Classic Emerald theme is available in the current plan.
          </p>
        </motion.div>

        {/* Current Theme Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border max-w-md">
            <div
              className="w-16 h-16 rounded-xl shadow-md"
              style={{
                backgroundColor: themes.find((t) => t.id === currentTheme)?.colors.primary,
              }}
            />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Theme</p>
              <p className="text-xl font-serif font-semibold text-foreground">
                {themes.find((t) => t.id === currentTheme)?.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                onClick={() => handleThemeSelect(theme.id, theme.locked)}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  currentTheme === theme.id
                    ? "border-primary ring-2 ring-primary/20"
                    : theme.locked
                    ? "border-border opacity-75"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Theme Preview */}
                <div
                  className="h-36 p-5 flex flex-col justify-between"
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="w-10 h-10 rounded-lg shadow-md"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-2.5 w-3/4 rounded"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="h-2 w-1/2 rounded"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                </div>

                {/* Theme Info */}
                <div className="p-4 bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif font-semibold text-foreground">
                      {theme.name}
                    </h3>
                    {theme.locked && (
                      <Lock size={16} className="text-muted-foreground" />
                    )}
                    {!theme.locked && currentTheme === theme.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {theme.description}
                  </p>

                  {/* Action Button */}
                  <Button
                    variant={currentTheme === theme.id ? "default" : "outline"}
                    className="w-full"
                    disabled={currentTheme === theme.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme.id, theme.locked);
                    }}
                  >
                    {theme.locked ? (
                      <>
                        <Lock size={16} className="mr-2" />
                        Locked
                      </>
                    ) : currentTheme === theme.id ? (
                      <>
                        <Check size={16} className="mr-2" />
                        Active
                      </>
                    ) : (
                      "Select Theme"
                    )}
                  </Button>
                </div>

                {/* Locked Overlay */}
                {theme.locked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="bg-card border border-border rounded-full p-3 shadow-lg">
                      <Lock size={24} className="text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-muted-foreground" />
            <div>
              <h3 className="font-medium text-foreground">Premium Themes</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade your plan to unlock additional premium themes. Contact support for more information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminThemes;
