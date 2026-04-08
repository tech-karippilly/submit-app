import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, MapPin, Loader2, ArrowRight } from "lucide-react";
import { eventApi, Event, PopulatedSpeaker } from "@/services/event.services";

const EventSchedule = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Get speaker name from speakerId
  const getSpeakerName = (speakerId: string | PopulatedSpeaker | undefined): string => {
    if (!speakerId) return "";
    if (typeof speakerId === "string") return speakerId;
    return speakerId.fullName;
  };

  return (
    <section className="section-padding gradient-hero text-primary-foreground">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Agenda</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold">
            Event <span className="text-gradient-gold">Schedule</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] md:left-[28px] top-0 bottom-0 w-px bg-gold/30" />

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gold" />
              </div>
            ) : events.length > 0 ? (
              events.map((event, i) => (
                <Link key={event._id} to={`/event/${event._id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-4 md:gap-6 cursor-pointer group py-2"
                  >
                    {/* Dot */}
                    <div className="flex-shrink-0 w-11 md:w-14 flex flex-col items-center pt-4">
                      <div className="w-3 h-3 rounded-full bg-gold ring-2 ring-gold/20 z-10" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 glass-card rounded-lg p-5 md:p-6 group-hover:bg-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2 text-gold text-xs font-medium">
                          <Clock size={12} />
                          {event.eventTime}
                        </div>
                        {event.eventLocation && (
                          <div className="flex items-center gap-1 text-primary-foreground/50 text-xs">
                            <MapPin size={11} />
                            {event.eventLocation}
                          </div>
                        )}
                      </div>
                      <h4 className="font-serif text-sm md:text-base font-semibold text-primary-foreground">
                        {event.eventName}
                      </h4>
                      {getSpeakerName(event.speakerId) && (
                        <p className="text-primary-foreground/60 text-xs mt-1">{getSpeakerName(event.speakerId)}</p>
                      )}
                      <span className="text-gold text-xs uppercase tracking-wider flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ArrowRight size={10} />
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-primary-foreground/60">No events scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSchedule;
