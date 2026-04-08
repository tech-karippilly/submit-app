import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Heart } from "lucide-react";
import { aboutApi, About } from "@/services/about.services";

const PAGE_TITLE = "About";

const defaultAbout: About = {
  _id: "",
  heroTitle: "About The Summit LLP",
  heroSubtitle: "Pioneering healthcare quality and sustainability across India and beyond.",
  whoWeAreTitle: "Who We Are",
  whoWeAreContent: "The Summit LLP was formed with a singular vision — to elevate healthcare quality standards across India by bringing together the finest minds in patient safety, quality improvement, and sustainable healthcare delivery. Founded by internationally certified healthcare quality professionals with Harvard credentials, we bridge the gap between global best practices and local implementation.",
  problemTitle: "The Problem in Indian Healthcare",
  problemContent: "Despite remarkable progress, Indian healthcare faces critical challenges in standardizing quality, ensuring patient safety, adopting sustainable practices, and meeting international accreditation benchmarks. The Summit LLP exists to address these gaps through education, collaboration, and leadership development.",
  vision: "To be India's leading platform for healthcare quality transformation and sustainable hospital practices.",
  mission: "Empowering healthcare professionals with knowledge, tools, and networks to deliver world-class patient care.",
  values: "Excellence, integrity, patient-centricity, innovation, and a commitment to global quality standards.",
  createdAt: "",
  updatedAt: "",
};

const AboutPage = () => {
  const [about, setAbout] = useState<About>(defaultAbout);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
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
      }
    };
    fetchAboutData();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">About Us</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">{about.heroTitle}</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              {about.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">{about.whoWeAreTitle}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {about.whoWeAreContent}
            </p>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
              {about.problemTitle}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {about.problemContent}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: "Vision", text: about.vision },
              { icon: Target, title: "Mission", text: about.mission },
              { icon: Heart, title: "Values", text: about.values },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg p-8 gold-border text-center"
              >
                <item.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
