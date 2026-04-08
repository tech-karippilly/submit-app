import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

const policies = [
  { key: "summit-privacy-policy", label: "Privacy Policy" },
  { key: "summit-refund-policy", label: "Refund Policy" },
  { key: "summit-cancellation-policy", label: "Cancellation Policy" },
  { key: "summit-confidentiality-statement", label: "Confidentiality Statement" },
];

const AdminPolicies = () => {
  const [active, setActive] = useState(0);
  const [contents, setContents] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Manage Policies | The Summit LLP";
    const loaded: Record<string, string> = {};
    policies.forEach((p) => {
      const saved = localStorage.getItem(p.key);
      if (saved) loaded[p.key] = saved;
    });
    setContents(loaded);
    return () => { document.title = "The Summit LLP"; };
  }, []);

  const currentKey = policies[active].key;
  const currentValue = contents[currentKey] ?? "";

  const handleSave = () => {
    localStorage.setItem(currentKey, currentValue);
    toast.success(`${policies[active].label} saved!`);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Policies</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit policy content displayed on the public pages</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {policies.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === i
                ? "gradient-gold text-emerald-dark"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          {policies[active].label} Content (separate paragraphs with blank lines)
        </label>
        <textarea
          rows={14}
          className={inputClass}
          value={currentValue}
          onChange={(e) => setContents({ ...contents, [currentKey]: e.target.value })}
          placeholder={`Enter ${policies[active].label.toLowerCase()} content...`}
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full mt-6 py-3 rounded-lg gradient-gold text-emerald-dark font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <Save size={16} /> Save {policies[active].label}
      </button>
    </div>
  );
};

export default AdminPolicies;
