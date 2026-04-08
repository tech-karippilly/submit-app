import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gem, Award, Medal, Loader2, ImageIcon } from "lucide-react";
import { sponsorApi, Sponsor, SponsorTier } from "@/services/sponsor.services";

const tierConfig = {
  diamond: {
    label: "Diamond Sponsors",
    icon: Gem,
    accent: "text-sky-400",
    border: "border-sky-400/30",
    bg: "bg-sky-400/5",
  },
  platinum: {
    label: "Platinum Sponsors",
    icon: Award,
    accent: "text-slate-300",
    border: "border-slate-300/30",
    bg: "bg-slate-300/5",
  },
  gold: {
    label: "Gold Sponsors",
    icon: Medal,
    accent: "text-gold",
    border: "border-gold/30",
    bg: "bg-gold/5",
  },
};

const SponsorsSection = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await sponsorApi.getAll({ isActive: true });
      setSponsors(response.data);
    } catch (error) {
      console.error("Failed to fetch sponsors:", error);
    } finally {
      setLoading(false);
    }
  };

  const tiers = (["diamond", "platinum", "gold"] as const)
    .map((tier) => ({
      ...tierConfig[tier],
      key: tier,
      sponsors: sponsors.filter((s) => s.tier === tier),
    }))
    .filter((t) => t.sponsors.length > 0);

  if (loading) {
    return (
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-5xl flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </section>
    );
  }

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">
            Our Partners
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Sponsors & <span className="text-gradient-gold">Partners</span>
          </h2>
        </motion.div>

        <div className="space-y-12">
          {tiers.map((tier) => (
            <div key={tier.key}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <tier.icon className={`w-5 h-5 ${tier.accent}`} />
                <h3 className={`font-serif text-xl font-bold ${tier.accent}`}>
                  {tier.label}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </motion.div>

              <div
                className={`grid ${
                  tier.key === "diamond"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                } gap-5`}
              >
                {tier.sponsors.map((sponsor, i) => (
                  <motion.div
                    key={sponsor._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className={`${tier.bg} rounded-lg border ${
                      tier.border
                    } ${
                      tier.key === "diamond" ? "p-8" : "p-6"
                    } flex flex-col items-center justify-center gap-3 hover:gold-glow transition-shadow duration-300`}
                  >
                    {sponsor.logo?.url ? (
                      <img
                        src={sponsor.logo.url}
                        alt={sponsor.name}
                        className={`object-contain ${
                          tier.key === "diamond" ? "w-24 h-24" : "w-16 h-16"
                        }`}
                      />
                    ) : (
                      <div
                        className={`${
                          tier.key === "diamond" ? "w-24 h-24" : "w-16 h-16"
                        } bg-muted rounded-lg flex items-center justify-center`}
                      >
                        <ImageIcon
                          className={`${
                            tier.key === "diamond" ? "w-12 h-12" : "w-8 h-8"
                          } text-muted-foreground`}
                        />
                      </div>
                    )}
                    <p
                      className={`font-medium text-foreground text-center ${
                        tier.key === "diamond" ? "text-base" : "text-sm"
                      }`}
                    >
                      {sponsor.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
