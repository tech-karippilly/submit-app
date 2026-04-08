import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, ArrowLeft, Loader2, Building, Award } from "lucide-react";
import { speakerApi, Speaker } from "@/services/speaker.services";

const SpeakerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSpeaker(id);
    }
  }, [id]);

  const fetchSpeaker = async (speakerId: string) => {
    setIsLoading(true);
    try {
      const response = await speakerApi.getById(speakerId);
      if (response.success && response.data) {
        setSpeaker(response.data);
        document.title = `${response.data.fullName} | The Summit LLP`;
      }
    } catch (error) {
      console.error("Failed to fetch speaker:", error);
      navigate("/speakers");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Speaker not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Speaker</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">{speaker.fullName}</h1>
            <p className="text-primary-foreground/70 text-lg">{speaker.title}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/speakers")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Speakers</span>
          </button>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl gold-border overflow-hidden mb-8"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 flex-shrink-0">
                {speaker.photo?.url ? (
                  <img
                    src={speaker.photo.url}
                    alt={speaker.fullName}
                    className="w-full h-72 lg:h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-72 lg:h-full bg-muted flex items-center justify-center">
                    <User className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-gold text-xs uppercase tracking-[0.3em] mb-2">{speaker.title}</p>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">{speaker.fullName}</h2>
                <p className="text-muted-foreground text-sm mb-4">{speaker.organization}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-gold" />
                  <p className="text-gold/80 text-sm uppercase tracking-wider">{speaker.topic}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-lg gold-border p-6 text-center"
            >
              <Building className="w-8 h-8 text-gold mx-auto mb-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Organization</p>
              <p className="font-serif text-sm font-semibold text-foreground">{speaker.organization}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg gold-border p-6 text-center"
            >
              <Award className="w-8 h-8 text-gold mx-auto mb-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Topic</p>
              <p className="font-serif text-sm font-semibold text-foreground">{speaker.topic}</p>
            </motion.div>
          </div>

          {/* Bio */}
          {speaker.bio && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="text-gold">✦</span> About {speaker.fullName.split(" ")[0]}
              </h3>
              <div className="bg-card rounded-lg gold-border p-8 lg:p-10">
                <p className="text-muted-foreground leading-relaxed">{speaker.bio}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SpeakerDetail;
