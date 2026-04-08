import { useState, useEffect } from "react";
import { Palette } from "lucide-react";

const themes = [
  { id: "ocean", label: "Ocean Blue", colors: ["hsl(210,55%,16%)", "hsl(38,80%,55%)"] },
  { id: "emerald", label: "Emerald & Gold", colors: ["hsl(152,50%,14%)", "hsl(43,72%,55%)"] },
  { id: "royal", label: "Royal Purple", colors: ["hsl(268,50%,16%)", "hsl(340,70%,55%)"] },
  { id: "sunset", label: "Warm Sunset", colors: ["hsl(15,55%,16%)", "hsl(45,85%,52%)"] },
];

const ThemeSwitcher = ({ collapsed }: { collapsed: boolean }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => {
    return localStorage.getItem("summit-theme") || "ocean";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", active);
    localStorage.setItem("summit-theme", active);
  }, [active]);

  return (
    <div className="relative px-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground transition-colors w-full"
      >
        <Palette size={18} />
        {!collapsed && <span>Theme</span>}
      </button>

      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-card border border-border rounded-xl shadow-xl p-3 space-y-2 z-50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Select Theme
          </p>
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setActive(theme.id);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                active === theme.id
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex gap-1">
                {theme.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
