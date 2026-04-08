import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { eventApi, Event } from "@/services/event.services";
import { enquiryApi } from "@/services/enquiry.services";
import { contactApi, Contact } from "@/services/contact.services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_TITLE = "Contact Us";

const Contact = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventId: "",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);

  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = "The Summit";
    };
  }, []);

  // Fetch events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getAll();
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch contact details
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await contactApi.get();
        if (response.success && response.data) {
          setContact(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch contact details:", error);
      } finally {
        setIsLoadingContact(false);
      }
    };
    fetchContact();
  }, []);
  useEffect(() => {
    const state = location.state as { eventId?: string; eventName?: string } | null;
    if (state?.eventId) {
      setFormData((prev) => ({
        ...prev,
        eventId: state.eventId,
      }));
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (value: string) => {
    setFormData((prev) => ({ ...prev, eventId: value === "none" ? "" : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await enquiryApi.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        eventId: formData.eventId || undefined,
        title: formData.title,
        description: formData.description,
      });

      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We will get back to you soon.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        eventId: "",
        title: "",
        description: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-3">Get In Touch</p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Contact Information</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {isLoadingContact 
                  ? "Loading contact information..." 
                  : contact?.about || "Reach out to us for any inquiries about our conferences, events, or partnerships. We'd love to hear from you."}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">{isLoadingContact ? "Loading..." : contact?.email || "info@thesummitllp.com"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">{isLoadingContact ? "Loading..." : contact?.phone || "+91 XXX XXX XXXX"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      {isLoadingContact 
                        ? "Loading..." 
                        : contact?.addressOne 
                          ? `${contact.name}${contact.addressTwo ? `, ${contact.addressTwo}` : ""}, ${contact.city}, ${contact.state} - ${contact.pinCode}`
                          : contact?.name || "The Summit LLP"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-card rounded-lg p-8 gold-border">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Name *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email *</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* Event Dropdown - Optional */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Related Event (Optional)
                    </label>
                    <Select
                      value={formData.eventId || "none"}
                      onValueChange={handleEventChange}
                      disabled={isLoadingEvents}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={isLoadingEvents ? "Loading events..." : "Select an event"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-muted-foreground">General Enquiry</span>
                        </SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event._id} value={event._id}>
                            {event.eventName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enquiry title"
                        required
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Phone</label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message *</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Your message..."
                      rows={5}
                      required
                      className="bg-background resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold/90 text-emerald-dark font-semibold py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
