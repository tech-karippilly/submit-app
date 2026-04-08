import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import { Calendar, Clock, MapPin, User, ArrowLeft, Loader2, ExternalLink, Building, Award, AlertCircle, XCircle } from "lucide-react";
import { eventApi, Event, PopulatedSpeaker } from "@/services/event.services";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await eventApi.getById(eventId);
      if (response.success && response.data) {
        setEvent(response.data);
        document.title = `${response.data.eventName} | The Summit LLP`;
      }
    } catch (error) {
      console.error("Failed to fetch event:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  // Get speaker info from speakerId
  const getSpeakerInfo = (speakerId: string | PopulatedSpeaker | undefined): { 
    _id: string;
    name: string; 
    title: string; 
    organization: string;
    topic: string;
    bio: string;
    photo?: { url: string };
  } => {
    if (!speakerId) return { _id: "", name: "", title: "", organization: "", topic: "", bio: "" };
    if (typeof speakerId === "string") return { _id: "", name: speakerId, title: "", organization: "", topic: "", bio: "" };
    return {
      _id: speakerId._id,
      name: speakerId.fullName,
      title: speakerId.title,
      organization: speakerId.organization,
      topic: speakerId.topic,
      bio: speakerId.bio,
      photo: speakerId.photo,
    };
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Event not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const speaker = getSpeakerInfo(event.speakerId);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Event</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">{event.eventName}</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">{event.eventDescription}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Home</span>
          </button>

          {/* Event Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl gold-border overflow-hidden mb-8"
          >
            <div className="p-8 lg:p-12">
              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                    <p className="text-foreground font-medium">{formatDate(event.eventDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time</p>
                    <p className="text-foreground font-medium">{event.eventTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                    <p className="text-foreground font-medium">{event.eventLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Speaker</p>
                    <p className="text-foreground font-medium">{speaker.name || "TBA"}</p>
                    {speaker.title && (
                      <p className="text-muted-foreground text-sm">{speaker.title}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Google Maps Link */}
              {event.eventGoogleLink && (
                <a
                  href={event.eventGoogleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-4"
                >
                  <ExternalLink size={16} />
                  <span>View on Google Maps</span>
                </a>
              )}

              {/* Countdown Timer */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {event.isExpired ? "Event Status" : "Time Remaining"}
                </p>
                <Countdown targetDate={event.eventDate} />
              </div>

              {/* Seats Info */}
              {event.capacity && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium">Seat Availability</span>
                  </div>
                  {event.seatsRemaining === 0 ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Sold Out</span>
                    </div>
                  ) : event.seatsRemaining !== undefined && event.seatsRemaining <= 10 ? (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Only {event.seatsRemaining} seats left!</span>
                    </div>
                  ) : (
                    <div className="text-foreground">
                      <span className="text-2xl font-bold text-gold">{event.seatsRemaining}</span>
                      <span className="text-muted-foreground"> / {event.capacity} seats available</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!event.isExpired && event.seatsRemaining !== 0 && (
                  <Link
                    to="/register"
                    state={{ eventId: event._id, eventName: event.eventName, registrationFee: event.registrationFee }}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-gold-light transition-colors"
                  >
                    Register Now
                  </Link>
                )}
                {event.seatsRemaining === 0 && (
                  <button
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground px-8 py-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    Sold Out
                  </button>
                )}
                <Link
                  to="/contact"
                  state={{ eventName: event.eventName }}
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gold text-gold px-8 py-4 rounded-lg font-semibold hover:bg-gold hover:text-primary-foreground transition-colors"
                >
                  Enquire
                </Link>
                <a
                  href={event.eventGoogleLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gold text-gold px-8 py-4 rounded-lg font-semibold hover:bg-gold hover:text-primary-foreground transition-colors"
                >
                  <MapPin size={18} />
                  Directions
                </a>
              </div>
            </div>
          </motion.div>

          {/* Speaker Details */}
          {speaker._id && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl gold-border overflow-hidden mb-8"
            >
              <div className="p-8 lg:p-12">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-gold" /> Featured Speaker
                </h3>
                <Link 
                  to={`/speaker/${speaker._id}`}
                  className="flex flex-col md:flex-row gap-6 group"
                >
                  <div className="md:w-48 flex-shrink-0">
                    {speaker.photo?.url ? (
                      <img
                        src={speaker.photo.url}
                        alt={speaker.name}
                        className="w-32 h-32 md:w-48 md:h-48 rounded-lg object-cover object-top mx-auto md:mx-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg bg-muted flex items-center justify-center mx-auto md:mx-0">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-serif text-2xl font-bold text-foreground mb-1 group-hover:text-gold transition-colors">
                      {speaker.name}
                    </h4>
                    <p className="text-gold text-sm uppercase tracking-wider mb-1">{speaker.title}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm mb-3">
                      <Building size={14} />
                      <span>{speaker.organization}</span>
                    </div>
                    {speaker.topic && (
                      <div className="flex items-center justify-center md:justify-start gap-2 text-gold/80 text-sm mb-4">
                        <Award size={14} />
                        <span className="uppercase tracking-wider">{speaker.topic}</span>
                      </div>
                    )}
                    {speaker.bio && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{speaker.bio}</p>
                    )}
                    <span className="text-gold text-xs uppercase tracking-wider flex items-center justify-center md:justify-start gap-1 mt-4">
                      View Full Profile <ArrowLeft size={12} className="rotate-180" />
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Event Itinerary */}
          {event.eventItinerary && Array.isArray(event.eventItinerary) && event.eventItinerary.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl gold-border overflow-hidden"
            >
              <div className="p-8 lg:p-12">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <span className="text-gold">✦</span> Event Itinerary
                </h3>
                <div className="space-y-4">
                  {event.eventItinerary.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex-shrink-0 w-24">
                        <p className="text-gold text-sm font-semibold">{item.time || 'TBA'}</p>
                        {item.duration && item.duration !== '()' && (
                          <p className="text-muted-foreground text-xs mt-1">{item.duration}</p>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                        {item.description && item.description !== '()' && (
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetail;
