import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Loader2, ArrowRight } from "lucide-react";
import { speakerApi, Speaker } from "@/services/speaker.services";

const PAGE_TITLE = "Speakers";

const Speakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
    };
  }, []);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await speakerApi.getAll();
        if (response.success && response.data) {
          setSpeakers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch speakers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpeakers();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Meet Our</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Distinguished Speakers</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl space-y-16">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : speakers.length > 0 ? (
            speakers.map((speaker, i) => (
              <Link key={speaker._id} to={`/speaker/${speaker._id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-lg overflow-hidden gold-border hover:shadow-lg hover:border-gold/50 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Speaker Image */}
                    <div className="md:w-56 flex-shrink-0">
                      {speaker.photo?.url ? (
                        <img
                          src={speaker.photo.url}
                          alt={speaker.fullName}
                          className="w-full h-56 md:h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-56 md:h-full bg-muted flex items-center justify-center">
                          <User className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-8 md:p-10">
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{speaker.fullName}</h2>
                      <p className="text-gold text-sm uppercase tracking-wider mb-1">{speaker.title}</p>
                      <p className="text-muted-foreground text-xs mb-4">{speaker.organization}</p>
                      {speaker.topic && (
                        <p className="text-gold/80 text-sm uppercase tracking-wider mb-4">{speaker.topic}</p>
                      )}
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{speaker.bio}</p>
                      <span className="text-gold text-sm uppercase tracking-wider flex items-center gap-2 mt-4">
                        View Full Profile <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No speakers found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Speakers;
