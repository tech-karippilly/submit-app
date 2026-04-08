import { useState, useEffect, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, User, CheckCircle, Copy, Loader2, Plus, X } from "lucide-react";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { participantsApi, Participant } from "@/services/participants.services";
import { eventApi } from "@/services/event.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_TITLE = "Register";

type RegistrantType = "professional" | "student";
type RegMode = "single" | "group";

interface RegistrationFee {
  professional_individuals: number;
  student_individuals: number;
  student_group_per_head: number;
}

interface EventCapacity {
  capacity?: number;
  seatsRemaining?: number;
  participantCount?: number;
}

const Register = () => {
  const location = useLocation();
  const state = location.state as { eventId?: string; eventName?: string; registrationFee?: RegistrationFee } | null;
  const navigate = useNavigate();

  const [type, setType] = useState<RegistrantType>("professional");
  const [mode, setMode] = useState<RegMode>("single");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdParticipantId, setCreatedParticipantId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [eventRegistrationFee, setEventRegistrationFee] = useState<RegistrationFee | null>(state?.registrationFee || null);
  const [eventCapacity, setEventCapacity] = useState<EventCapacity | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    if (state?.eventId) {
      setSelectedEventId(state.eventId);
      // If registrationFee is not in state, fetch it from the event API
      if (!state?.registrationFee) {
        fetchEventDetails(state.eventId);
      }
    }
    return () => { document.title = "The Summit"; };
  }, [state?.eventId]);

  const fetchEventDetails = async (eventId: string) => {
    try {
      setLoadingEvent(true);
      const response = await eventApi.getById(eventId);
      if (response.success && response.data) {
        if (response.data.registrationFee) {
          setEventRegistrationFee(response.data.registrationFee);
        }
        setEventCapacity({
          capacity: response.data.capacity,
          seatsRemaining: response.data.seatsRemaining,
          participantCount: response.data.participantCount,
        });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event information");
    } finally {
      setLoadingEvent(false);
    }
  };

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    designation: "", organization: "", experience: "",
    college: "", course: "", yearOfStudy: "", studentId: "",
    terms: false,
  });

  const [groupMembers, setGroupMembers] = useState<{ name: string; email: string; phone: string }[]>([]);

  // Calculate total group size (leader + members)
  const getGroupSize = () => {
    if (mode !== "group") return 1;
    return groupMembers.length + 1; // +1 for the leader
  };

  // Calculate registration fee based on event-specific fees
  const getPrice = () => {
    const fees = eventRegistrationFee;
    if (!fees) return 0;

    if (type === "professional") {
      return fees.professional_individuals;
    } else if (type === "student") {
      if (mode === "single") {
        return fees.student_individuals;
      } else {
        // Group: Student Group Fee per Head * size of group
        const groupSize = getGroupSize();
        return fees.student_group_per_head * groupSize;
      }
    }
    return 0;
  };

  const addMember = () => {
    if (groupMembers.length < 10) {
      setGroupMembers([...groupMembers, { name: "", email: "", phone: "" }]);
    }
  };

  const removeMember = (index: number) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    setGroupMembers((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (type === "professional" && (!form.designation.trim() || !form.organization.trim())) {
      toast.error("Please fill designation and organization.");
      return;
    }
    if (type === "student" && (!form.college.trim() || !form.course.trim())) {
      toast.error("Please fill college and course details.");
      return;
    }
    if (type === "student" && mode === "group") {
      if (groupMembers.length === 0) {
        toast.error("Please add at least one group member.");
        return;
      }
      const incomplete = groupMembers.some((m) => !m.name.trim() || !m.email.trim());
      if (incomplete) {
        toast.error("Please fill all group member details.");
        return;
      }
    }
    if (!form.terms) {
      toast.error("Please accept the terms & conditions.");
      return;
    }

    // We must have an event ID from the event detail page
    if (!selectedEventId) {
      toast.error("No event selected. Please start registration from an event detail page.");
      return;
    }

    try {
      setSubmitting(true);

      const price = getPrice();

      let createdParticipant: Participant | null = null;

      if (type === "student") {
        if (mode === "group") {
          const res = await participantsApi.registerStudentGroup({
            eventId: selectedEventId,
            full_name: form.name,
            email: form.email,
            phone: form.phone,
            collageName: form.college,
            course: form.course,
            members: groupMembers.map((m, index) => ({
              full_name: m.name,
              email: m.email,
              phone: m.phone,
              isLeader: index === 0,
            })),
            registrationFee: price,
          });
          createdParticipant = res.data;
        } else {
          const res = await participantsApi.registerStudentIndividual({
            eventId: selectedEventId,
            full_name: form.name,
            email: form.email,
            phone: form.phone,
            collageName: form.college,
            course: form.course,
            registrationFee: price,
          });
          createdParticipant = res.data;
        }
      } else {
        const res = await participantsApi.registerProfessional({
          eventId: selectedEventId,
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          designation: form.designation,
          organization: form.organization,
          yearsOfExperience: Number(form.experience || 0),
          registrationFee: price,
        });
        createdParticipant = res.data;
      }

      setCreatedParticipantId(createdParticipant?._id ?? null);
      setShowConfirm(true);
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit registration. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow";

  const price = getPrice();

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="gradient-hero text-primary-foreground pt-28 pb-12 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-2">Join Us</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Register Now</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto max-w-5xl">
          {/* Event Capacity Info */}
          {selectedEventId && eventCapacity?.capacity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {state?.eventName || "Selected Event"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {eventCapacity.seatsRemaining === 0 ? (
                      <span className="text-red-500 font-semibold">Sold Out</span>
                    ) : eventCapacity.seatsRemaining !== undefined && eventCapacity.seatsRemaining <= 10 ? (
                      <span className="text-amber-600 font-semibold">
                        Only {eventCapacity.seatsRemaining} seats left! Book now!
                      </span>
                    ) : (
                      <span>
                        <span className="text-gold font-semibold">{eventCapacity.seatsRemaining}</span> seats available out of {eventCapacity.capacity}
                      </span>
                    )}
                  </p>
                </div>
                {eventCapacity.seatsRemaining === 0 && (
                  <div className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full">
                    Registration Closed
                  </div>
                )}
                {eventCapacity.seatsRemaining !== undefined && eventCapacity.seatsRemaining > 0 && eventCapacity.seatsRemaining <= 10 && (
                  <div className="px-3 py-1 bg-amber-500/10 text-amber-600 text-xs font-semibold rounded-full">
                    Limited Seats
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-lg p-6 gold-border"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Registration Options */}
              <div className="lg:col-span-1 space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">I am registering as *</label>
                  <div className="flex rounded-lg overflow-hidden border border-border">
                    {(["professional", "student"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${type === t ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration mode */}
                {type === "student" && (
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Registration Type *</label>
                    <div className="flex rounded-lg overflow-hidden border border-border">
                      <button
                        type="button"
                        onClick={() => setMode("single")}
                        className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${mode === "single" ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}
                      >
                        <User size={12} /> Single
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMode("group"); setGroupMembers([]); }}
                        className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${mode === "group" ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}
                      >
                        <Users size={12} /> Group
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Lead registrant */}
                <div className="space-y-3">
                  {mode === "group" && <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lead Registrant (You)</p>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Full Name *</label>
                      <input required className={inputClass} placeholder="Your full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Phone *</label>
                      <input required type="tel" className={inputClass} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Email *</label>
                    <input required type="email" className={inputClass} placeholder="your@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                </div>

                {/* Conditional fields */}
                {type === "professional" ? (
                  <motion.div key="professional" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Designation *</label>
                        <input required className={inputClass} placeholder="e.g. Quality Manager" value={form.designation} onChange={(e) => update("designation", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Organization *</label>
                        <input required className={inputClass} placeholder="Hospital/Org" value={form.organization} onChange={(e) => update("organization", e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="student" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">College *</label>
                        <input required className={inputClass} placeholder="College/University" value={form.college} onChange={(e) => update("college", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Course *</label>
                        <input required className={inputClass} placeholder="e.g. MBBS" value={form.course} onChange={(e) => update("course", e.target.value)} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Group member fields */}
                {mode === "group" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {groupMembers.map((member, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-muted/20 rounded-lg p-3 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Member {i + 2}</p>
                          <button
                            type="button"
                            onClick={() => removeMember(i)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input className={inputClass} placeholder="Full name *" value={member.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
                          <input className={inputClass} placeholder="Email *" value={member.email} onChange={(e) => updateMember(i, "email", e.target.value)} />
                          <input className={inputClass} placeholder="Phone" value={member.phone} onChange={(e) => updateMember(i, "phone", e.target.value)} />
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Add member button */}
                    {groupMembers.length < 10 && (
                      <button
                        type="button"
                        onClick={addMember}
                        className="w-full py-2 border-2 border-dashed border-gold/40 rounded-lg text-gold text-xs uppercase tracking-wider hover:border-gold hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Member ({10 - groupMembers.length} remaining)
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Fee Display */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Registration Fee</p>
                      {mode === "group" && type === "student" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ₹{eventRegistrationFee?.student_group_per_head || 0} × {getGroupSize()} members
                        </p>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gold">₹{price.toLocaleString()}</p>
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.terms} onChange={(e) => update("terms", e.target.checked)} className="mt-0.5 accent-gold-DEFAULT" />
                  <span className="text-xs text-muted-foreground">
                    I agree to the terms & conditions and privacy policy.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={submitting || eventCapacity?.seatsRemaining === 0}
                  className="w-full gradient-gold text-emerald-dark font-semibold py-3 rounded-lg text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : eventCapacity?.seatsRemaining === 0 ? (
                    "Sold Out"
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </section>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md text-left">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Confirm Registration</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Please confirm your details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Full Name</span>
              <span className="col-span-2 font-medium text-foreground">{form.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Email</span>
              <span className="col-span-2 font-medium text-foreground">{form.email}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Phone</span>
              <span className="col-span-2 font-medium text-foreground">{form.phone}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">Event</span>
              <span className="col-span-2 font-medium text-foreground">{state?.eventName || "Selected Event"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border mt-2">
              <span className="text-muted-foreground">Amount</span>
              <div className="col-span-2">
                <span className="font-semibold text-gold">₹{price.toLocaleString()}</span>
                {mode === "group" && type === "student" && eventRegistrationFee && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{eventRegistrationFee.student_group_per_head} × {getGroupSize()} members
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Edit Details
            </button>
            <button
              type="button"
              disabled={paying || !createdParticipantId}
              onClick={async () => {
                if (!createdParticipantId) return;
                try {
                  setPaying(true);
                  // Dummy payment: mark as paid
                  await participantsApi.updatePaymentStatus(createdParticipantId, "paid");
                  toast.success("Payment successful. Registration completed.");

                  // Show success modal
                  setShowConfirm(false);
                  setShowSuccess(true);
                  
                  // Trigger confetti animation
                  confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D4AF37', '#10B981', '#FFD700', '#FFA500'],
                  });
                  
                  // Second burst for more effect
                  setTimeout(() => {
                    confetti({
                      particleCount: 100,
                      spread: 60,
                      origin: { y: 0.7 },
                      colors: ['#D4AF37', '#10B981', '#FFD700'],
                    });
                  }, 250);
                } catch (error) {
                  console.error("Error updating payment status:", error);
                  toast.error("Failed to update payment status.");
                } finally {
                  setPaying(false);
                }
              }}
              className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay & Confirm"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={() => navigate("/")}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Registration Successful!
            </h2>
            <p className="text-muted-foreground mb-4">
              Thank you for registering to this event.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground">
                Check your email for more updates.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-lg gradient-gold text-emerald-dark font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Home
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
