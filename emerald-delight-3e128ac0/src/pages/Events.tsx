import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, MapPin, User, Loader2, ArrowRight, XCircle, AlertCircle } from "lucide-react";
import { eventApi, Event, PopulatedSpeaker } from "@/services/event.services";

const PAGE_TITLE = "Events";

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAll();
        if (response.success && response.data) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Get speaker info from speakerId
  const getSpeakerName = (speakerId: string | PopulatedSpeaker | undefined): string => {
    if (!speakerId) return "";
    if (typeof speakerId === "string") return speakerId;
    return speakerId.fullName;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Upcoming</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Events</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Explore our curated lineup of conferences, workshops, and networking sessions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events List */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : events.length > 0 ? (
            <div className="flex flex-col gap-8">
              {events.map((event, i) => (
                <Link key={event._id} to={`/event/${event._id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl gold-border overflow-hidden hover:shadow-lg hover:border-gold/50 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Date Badge */}
                      <div className="md:w-40 flex-shrink-0 bg-gold/10 flex items-center justify-center p-6 md:p-8">
                        <div className="text-center">
                          <p className="text-gold text-3xl font-bold">
                            {new Date(event.eventDate).getDate()}
                          </p>
                          <p className="text-gold/80 text-sm uppercase">
                            {new Date(event.eventDate).toLocaleDateString("en-US", { month: "short" })}
                          </p>
                          <p className="text-muted-foreground text-xs mt-1">
                            {new Date(event.eventDate).getFullYear()}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 md:p-8">
                        {/* Status Badge */}
                        {(event as any).status === 'cancelled' && (
                          <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
                            <XCircle size={12} />
                            Cancelled
                            {(event as any).statusReason && (
                              <span className="text-red-400 font-normal">- {(event as any).statusReason}</span>
                            )}
                          </div>
                        )}
                        
                        {/* Limited Seats Badge */}
                        {event.capacity && event.seatsRemaining !== undefined && event.seatsRemaining <= 10 && event.seatsRemaining > 0 && (
                          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3 ml-2">
                            <AlertCircle size={12} />
                            Only {event.seatsRemaining} seats left
                          </div>
                        )}
                        
                        {/* Sold Out Badge */}
                        {event.capacity && event.seatsRemaining === 0 && (
                          <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3 ml-2">
                            <XCircle size={12} />
                            Sold Out
                          </div>
                        )}
                        
                        <h3 className={`font-serif text-xl md:text-2xl font-bold mb-3 ${(event as any).status === 'cancelled' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {event.eventName}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {event.eventDescription}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gold" />
                            <span>{event.eventTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gold" />
                            <span>{event.eventLocation}</span>
                          </div>
                          {getSpeakerName(event.speakerId) && (
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gold" />
                              <span>{getSpeakerName(event.speakerId)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-gold font-semibold">
                            {event.isCommonFee 
                              ? "Common Fee" 
                              : `₹${event.registrationFee.student_individuals.toLocaleString()}`}
                          </p>
                          <span className="text-gold text-sm uppercase tracking-wider flex items-center gap-2">
                            View Details <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No events scheduled yet.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
