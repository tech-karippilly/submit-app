import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, BookOpen, Briefcase, GraduationCap, Heart, ArrowLeft, Loader2 } from "lucide-react";
import founderImg from "@/assets/founder-placeholder.jpg";
import { founderApi, Founder as FounderType } from "@/services/founder.services";

const FounderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [founder, setFounder] = useState<FounderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchFounder(id);
    }
  }, [id]);

  const fetchFounder = async (founderId: string) => {
    setIsLoading(true);
    try {
      const response = await founderApi.getById(founderId);
      if (response.success && response.data) {
        setFounder(response.data);
        document.title = `${response.data.fullName} | The Summit LLP`;
      }
    } catch (error) {
      console.error("Failed to fetch founder:", error);
      navigate("/founder");
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

  if (!founder) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Founder not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const details = [
    { icon: Briefcase, label: "Experience", value: `${founder.experience?.length || 0} positions` },
    { icon: Heart, label: "Hospital", value: founder.hospital || "N/A" },
    { icon: BookOpen, label: "Publications", value: `${founder.publications?.length || 0} publications` },
    { icon: GraduationCap, label: "Education", value: founder.education?.[0] || "N/A" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">
              {founder.type === 'Founder' ? 'Founder' : 'Co-Founder'}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">{founder.fullName}</h1>
            <p className="text-primary-foreground/70 text-lg">{founder.title}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/founder")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Founders</span>
          </button>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl gold-border overflow-hidden mb-8"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 flex-shrink-0">
                <img
                  src={founder.profileImage?.url || founderImg}
                  alt={founder.fullName}
                  className="w-full h-72 lg:h-full object-cover object-top"
                />
              </div>
              <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-gold text-xs uppercase tracking-[0.3em] mb-2">{founder.title}</p>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{founder.fullName}</h2>
                <p className="text-muted-foreground leading-relaxed">{founder.professionalSummary}</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {details.map((detail, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-lg gold-border p-6 text-center"
              >
                <detail.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{detail.label}</p>
                <p className="font-serif text-sm font-semibold text-foreground">{detail.value}</p>
              </motion.div>
            ))}
          </div>

          {/* About */}
          {founder.about && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="text-gold">✦</span> About {founder.fullName.split(" ")[0]}
              </h3>
              <div className="bg-card rounded-lg gold-border p-8 lg:p-10">
                {founder.about.split("\n\n").map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Education */}
          {founder.education && founder.education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-gold" /> Education
              </h3>
              <div className="space-y-3">
                {founder.education.map((edu, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-lg gold-border px-6 py-4 flex items-start gap-3"
                  >
                    <span className="text-gold mt-0.5">✦</span>
                    <p className="text-sm text-foreground">{edu}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Experience */}
          {founder.experience && founder.experience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-gold" /> Experience
              </h3>
              <div className="space-y-3">
                {founder.experience.map((exp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-lg gold-border px-6 py-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{exp.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Certifications */}
          {founder.certifications && founder.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Award className="w-6 h-6 text-gold" /> Certifications
              </h3>
              <div className="space-y-3">
                {founder.certifications.map((cert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-lg gold-border px-6 py-4 flex items-start gap-3"
                  >
                    <span className="text-gold mt-0.5">✦</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{cert.title}</p>
                      <p className="text-xs text-muted-foreground">{cert.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Publications */}
          {founder.publications && founder.publications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-gold" /> Publications
              </h3>
              <div className="space-y-3">
                {founder.publications.map((pub, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-lg gold-border px-6 py-4 flex items-start gap-3"
                  >
                    <span className="text-gold mt-0.5">✦</span>
                    <p className="text-sm text-foreground">{pub}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FounderDetail;
