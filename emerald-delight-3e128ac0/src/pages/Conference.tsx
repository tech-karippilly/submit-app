import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Users, Award, ArrowRight, HelpCircle } from "lucide-react";

const PAGE_TITLE = "Conference";

const faqs = [
  { q: "Who should attend?", a: "Hospital administrators, quality managers, patient safety officers, healthcare professionals, and anyone passionate about improving healthcare standards." },
  { q: "Will certificates be provided?", a: "Yes, all registered participants will receive a certificate of participation from The Summit LLP." },
  { q: "Is there a dress code?", a: "Business formal is recommended for the conference sessions." },
  { q: "Can I get a refund?", a: "Refund policies will be shared upon registration. Please contact us for specific queries." },
];

const Conference = () => {
  // Dynamic document title
  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Event Details</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Conference Details</h1>
          </motion.div>
        </div>
      </section>

      {/* Key Info */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Calendar, label: "Date", value: "Coming Soon" },
              { icon: MapPin, label: "Venue", value: "Kerala, India" },
              { icon: Users, label: "Capacity", value: "Limited Seats" },
              { icon: Award, label: "Certification", value: "Included" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-lg p-6 gold-border text-center"
              >
                <item.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{item.label}</p>
                <p className="font-serif text-lg font-bold text-foreground">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Agenda */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">Agenda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "Morning Sessions",
                  icon: Clock,
                  items: ["Opening Keynote & Welcome Address", "Patient Safety & Global Standards", "Interactive Q&A Panel"],
                },
                {
                  title: "Afternoon Sessions",
                  icon: Clock,
                  items: ["AI in Healthcare Quality", "Sustainable Healthcare Systems", "Networking & Closing Ceremony"],
                },
              ].map((block, i) => (
                <div key={i} className="bg-secondary rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <block.icon className="w-5 h-5 text-gold" />
                    <h3 className="font-serif text-xl font-bold text-foreground">{block.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-gold">✦</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card rounded-lg p-6 gold-border">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                      <p className="text-muted-foreground text-sm">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              to="/register"
              className="gradient-gold text-emerald-dark font-semibold px-12 py-4 rounded-lg text-sm uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              Register Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Conference;
