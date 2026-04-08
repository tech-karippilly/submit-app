import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Loader2 } from "lucide-react";
import founderImg from "@/assets/founder-placeholder.jpg";
import { founderApi, Founder as FounderType } from "@/services/founder.services";

const PAGE_TITLE = "Founders";

const FounderCard = ({ founder, index }: { founder: FounderType; index: number }) => (
  <Link to={`/founder/${founder._id}`} className="block mb-10 last:mb-0">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="bg-card rounded-xl gold-border overflow-hidden hover:shadow-lg hover:border-gold/50 transition-all cursor-pointer"
    >
      <div className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
        <div className="lg:w-1/3 flex-shrink-0">
          <img
            src={founder.profileImage?.url || founderImg}
            alt={founder.fullName}
            className="w-full h-72 lg:h-full object-cover object-top"
          />
        </div>
        <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center">
          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-2">
            {founder.type === 'Founder' ? 'Founder' : 'Co-Founder'}
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{founder.fullName}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">{founder.professionalSummary}</p>
          <span className="text-gold text-sm uppercase tracking-wider flex items-center gap-2">
            View Full Profile <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.div>
  </Link>
);

const Founder = () => {
  const [founders, setFounders] = useState<FounderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => { document.title = "The Summit"; };
  }, []);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const response = await founderApi.getAll();
        if (response.success && response.data) {
          setFounders(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch founders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFounders();
  }, []);

  // Sort: Founder first, then CoFounder
  const sortedFounders = founders.sort((a, b) => {
    if (a.type === 'Founder' && b.type !== 'Founder') return -1;
    if (a.type !== 'Founder' && b.type === 'Founder') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Meet The</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Founders</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : sortedFounders.length > 0 ? (
            sortedFounders.map((founder, i) => (
              <FounderCard key={founder._id} founder={founder} index={i} />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No founders found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Founder;
