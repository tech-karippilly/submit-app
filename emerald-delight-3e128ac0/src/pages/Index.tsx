import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, Sparkles, X } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import founderImg from "@/assets/founder-placeholder.jpg";
import carousel1 from "@/assets/carousel-1.jpg";
import carousel2 from "@/assets/carousel-2.jpg";
import carousel3 from "@/assets/carousel-3.jpg";
import carousel4 from "@/assets/carousel-4.jpg";
import carousel5 from "@/assets/carousel-5.jpg";
import heroMedical1 from "@/assets/hero-medical-1.jpg";
import heroMedical2 from "@/assets/hero-medical-2.jpg";
import heroMedical3 from "@/assets/hero-medical-3.jpg";
import heroMedical4 from "@/assets/hero-medical-4.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollingQuotes from "@/components/ScrollingQuotes";
import EventCarousel from "@/components/EventCarousel";
import SpeakerCard from "@/components/SpeakerCard";
import EventSchedule from "@/components/EventSchedule";
import SponsorsSection from "@/components/SponsorsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { heroApi, Hero } from "@/services/hero.services";
import { founderApi, Founder } from "@/services/founder.services";
import { speakerApi, Speaker } from "@/services/speaker.services";
import { eventApi, Event } from "@/services/event.services";
import { participantsApi } from "@/services/participants.services";

const heroImageMap: Record<string, string> = {
  "hero-bg": heroBg,
  "carousel-1": carousel1,
  "carousel-2": carousel2,
  "carousel-3": carousel3,
  "carousel-4": carousel4,
  "carousel-5": carousel5,
  "hero-medical-1": heroMedical1,
  "hero-medical-2": heroMedical2,
  "hero-medical-3": heroMedical3,
  "hero-medical-4": heroMedical4,
};

const PAGE_TITLE = "Home";

const defaultHero: Hero = {
  _id: "",
  topSubtitle: "The Summit LLP Presents",
  mainTitle: "Healthcare Quality",
  titleHighlight: "& Sustainability",
  description: "A premier conference bringing together global healthcare leaders, quality experts, and innovators.",
  tagline: "Founded by Harvard-certified healthcare quality professional",
  participationCount: 150,
  eventsCount: 0,
  carousel: [],
  backgroundImage: { public_id: "", url: "" },
  updatedAt: "",
};



const Index = () => {
  const [heroData, setHeroData] = useState<Hero>(defaultHero);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [showNewEventBadge, setShowNewEventBadge] = useState(false);
  const [newestEvent, setNewestEvent] = useState<Event | null>(null);
  
  // Use API background image if available, otherwise fallback to default
  const currentHeroBg = heroData.backgroundImage?.url || heroBg;

  // Fetch hero data from API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await heroApi.get();
        if (response.success && response.data) {
          setHeroData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  // Fetch founders data from API
  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const response = await founderApi.getAll();
        if (response.success && response.data) {
          setFounders(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch founders:", error);
      }
    };
    fetchFounders();
  }, []);

  // Get founder and co-founder
  const founder = founders.find(f => f.type === 'Founder');
  const coFounder = founders.find(f => f.type === 'CoFounder');

  // Fetch speakers data from API
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await speakerApi.getAll();
        if (response.success && response.data) {
          setSpeakers(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch speakers:", error);
      }
    };
    fetchSpeakers();
  }, []);

  // Fetch events data from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAll();
        if (response.success && response.data) {
          setEvents(response.data);
          
          // Check for new events (added today or yesterday only)
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const sortedEvents = [...response.data].sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          if (sortedEvents.length > 0) {
            const latestEvent = sortedEvents[0];
            const eventCreatedAt = new Date(latestEvent.createdAt || 0);
            const eventCreatedDate = new Date(
              eventCreatedAt.getFullYear(),
              eventCreatedAt.getMonth(),
              eventCreatedAt.getDate()
            );
            
            // Check if event was created today or yesterday
            const isTodayOrYesterday = 
              eventCreatedDate.getTime() === today.getTime() ||
              eventCreatedDate.getTime() === yesterday.getTime();
            
            // Check if event is not expired
            const eventDate = new Date(latestEvent.eventDate);
            const isNotExpired = eventDate >= now;
            
            // Check if this event hasn't been dismissed
            const dismissedEvents = JSON.parse(localStorage.getItem('dismissedEvents') || '[]');
            const isDismissed = dismissedEvents.includes(latestEvent._id);
            
            if (isTodayOrYesterday && isNotExpired && !isDismissed) {
              setNewestEvent(latestEvent);
              setShowNewEventBadge(true);
              
              // Auto-dismiss after 30 seconds
              setTimeout(() => {
                setShowNewEventBadge(false);
              }, 30000);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch participants count from API
  useEffect(() => {
    const fetchParticipantsCount = async () => {
      try {
        const response = await participantsApi.getAll({ limit: 1 });
        if (response.success) {
          setParticipantsCount(response.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch participants count:", error);
      }
    };
    fetchParticipantsCount();
  }, []);

  // Handle dismiss new event badge
  const handleDismissBadge = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newestEvent) {
      const dismissedEvents = JSON.parse(localStorage.getItem('dismissedEvents') || '[]');
      dismissedEvents.push(newestEvent._id);
      localStorage.setItem('dismissedEvents', JSON.stringify(dismissedEvents));
    }
    setShowNewEventBadge(false);
  };

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* New Event Notification Badge */}
      <AnimatePresence>
        {showNewEventBadge && newestEvent && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-20 right-4 z-50"
          >
            <Link
              to={`/event/${newestEvent._id}`}
              className="block bg-gradient-to-br from-[#1a3a2f] to-[#0d1f1a] border border-[#D4AF37]/40 text-white rounded-xl shadow-xl shadow-black/20 overflow-hidden max-w-xs"
            >
              <div className="relative p-4">
                {/* Gold accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>
                
                {/* Close button */}
                <button
                  onClick={handleDismissBadge}
                  className="absolute top-3 right-3 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
                >
                  <X size={16} />
                </button>
                
                {/* Badge content */}
                <div className="flex items-start gap-3 pt-2">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0d1f1a] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        New Event
                      </span>
                    </div>
                    <h4 className="font-serif font-semibold text-sm leading-tight mb-1 text-white">
                      {newestEvent.eventName}
                    </h4>
                    <p className="text-xs text-[#D4AF37]/80">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(newestEvent.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Animated pulse dot - gold */}
                <span className="absolute top-3 left-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFD700]"></span>
                </span>
                
                {/* Progress bar for auto-dismiss */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]/20">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: heroData.backgroundImage?.url ? `url(${heroData.backgroundImage.url})` : `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-emerald-dark/70" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-gold font-medium tracking-[0.3em] uppercase text-sm mb-6">
              {heroData.topSubtitle}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight mb-6">
              {heroData.mainTitle}
              <br />
              <span className="text-gradient-gold">{heroData.titleHighlight}</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto mb-4 font-light">
              {heroData.description}
            </p>
            <p className="text-gold/80 text-sm tracking-wider mb-10">
              {heroData.tagline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/events"
                className="gradient-gold text-emerald-dark font-semibold px-10 py-4 rounded-lg text-sm uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                View Events <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="border border-gold/30 text-primary-foreground px-10 py-4 rounded-lg text-sm uppercase tracking-wider hover:bg-gold/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Stats counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 inline-flex items-center gap-6 glass-card rounded-full px-8 py-3"
          >
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gold" />
              <span className="text-primary-foreground/80 text-sm">
                <span className="text-gold font-bold text-lg">{participantsCount || heroData.participationCount}+</span> Participants
              </span>
            </div>
            <div className="w-px h-5 bg-primary-foreground/20" />
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gold" />
              <span className="text-primary-foreground/80 text-sm">
                <span className="text-gold font-bold text-lg">{events.length || heroData.eventsCount}+</span> Events
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Quotes */}
      <ScrollingQuotes />

      {/* Event Carousel */}
      <EventCarousel />

      {/* Founders Section */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Leadership</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Meet Our <span className="text-gradient-gold">Founders</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[founder, coFounder].filter(Boolean).map((f, i) => (
              <Link
                key={f._id}
                to={`/founder/${f._id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-xl gold-border overflow-hidden hover:shadow-lg hover:border-gold/50 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <img 
                      src={f.profileImage?.url || founderImg} 
                      alt={f.fullName} 
                      className="w-full h-52 object-cover object-top" 
                    />
                  </div>
                  <div className="p-6 flex flex-col">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">{f.fullName}</h3>
                    <p className="text-gold text-xs uppercase tracking-wider mb-3">{f.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1 line-clamp-3">{f.professionalSummary}</p>
                    <span className="text-gold text-xs uppercase tracking-wider flex items-center gap-1">
                      View Profile <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
            {founders.length === 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-card rounded-xl gold-border overflow-hidden"
                >
                  <div className="flex-shrink-0">
                    <img src={founderImg} alt="Founder" className="w-full h-52 object-cover object-top" />
                  </div>
                  <div className="p-6 flex flex-col">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">Founder</h3>
                    <p className="text-gold text-xs uppercase tracking-wider mb-3">Managing Director</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                      Harvard-certified healthcare quality professional with extensive experience in hospital administration.
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="bg-card rounded-xl gold-border overflow-hidden"
                >
                  <div className="flex-shrink-0">
                    <img src={founderImg} alt="Co-Founder" className="w-full h-52 object-cover object-top" />
                  </div>
                  <div className="p-6 flex flex-col">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">Co-Founder</h3>
                    <p className="text-gold text-xs uppercase tracking-wider mb-3">Director of Operations</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                      Experienced healthcare administrator with expertise in hospital operations and strategic planning.
                    </p>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/founder"
              className="gradient-gold text-emerald-dark font-semibold px-8 py-3 rounded-lg text-sm uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              View Full Profiles <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Speakers */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Featured</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Speaker Topics
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {speakers.length > 0 ? (
              speakers.slice(0, 3).map((speaker, i) => (
                <SpeakerCard 
                  key={speaker._id} 
                  id={speaker._id}
                  name={speaker.fullName} 
                  topic={speaker.topic} 
                  quote={speaker.bio} 
                  image={speaker.photo?.url} 
                  index={i} 
                />
              ))
            ) : (
              <>
                <SpeakerCard name="Speaker 1" topic="Patient Safety" quote="Excellence in patient care begins with uncompromising quality standards." index={0} />
                <SpeakerCard name="Speaker 2" topic="AI in Healthcare" quote="Artificial intelligence will redefine how we measure and deliver care quality." index={1} />
                <SpeakerCard name="Speaker 3" topic="Sustainable Systems" quote="The future of healthcare is green, efficient, and patient-centered." index={2} />
              </>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/speakers"
              className="text-gold hover:text-gold-light transition-colors text-sm uppercase tracking-wider inline-flex items-center gap-2"
            >
              View All Speakers <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Event Schedule */}
      <EventSchedule />

      {/* Why Kerala Section */}
      <section className="section-padding gradient-hero text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Leadership Insight</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
              Why Kerala? <span className="text-gradient-gold">Why Now?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {[
                "Rising accreditation needs across Indian hospitals",
                "New sustainability mandates in healthcare delivery",
                "The AI revolution transforming quality measurement",
                "International quality expectations for medical tourism",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-lg p-5 flex items-start gap-3"
                >
                  <span className="text-gold text-lg mt-0.5">✦</span>
                  <p className="text-primary-foreground/80 text-sm leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Sponsors & Partners */}
      <SponsorsSection />

      {/* CTA */}
      <section className="section-padding bg-background text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-2xl"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Secure Your <span className="text-gradient-gold">Seat</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Join healthcare leaders from across India and beyond. Limited seats available.
          </p>
          <Link
            to="/events"
            className="gradient-gold text-emerald-dark font-semibold px-12 py-4 rounded-lg text-sm uppercase tracking-wider hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            View Events <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary py-16 px-6">
        <div className="container mx-auto max-w-xl text-center">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Stay Updated</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Subscribe to receive conference updates and healthcare insights.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button className="gradient-gold text-emerald-dark font-semibold px-6 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
