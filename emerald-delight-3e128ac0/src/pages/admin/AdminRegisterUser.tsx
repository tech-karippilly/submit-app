import { useState, FormEvent, useEffect } from "react";
import { Users, User, Minus, Plus, Save, Loader2, CheckCircle, Mail, CreditCard, X, Eye, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { pricingApi, PaymentFee, AttendeeType } from "@/services/pricing.services";
import { eventApi, Event } from "@/services/event.services";
import { participantsApi, IMember } from "@/services/participants.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_TITLE = "Register User";

type RegistrantType = AttendeeType;
type RegMode = "single" | "group";

interface Registration {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  eventId: string;
  eventName: string;
  paymentStatus: "pending" | "paid" | "waived" | "refunded";
  registrationFee: number;
  createdAt: string;
  isStudent: boolean;
  isGroup: boolean;
}

const AdminRegisterUser = () => {
  const [type, setType] = useState<RegistrantType>("professional");
  const [mode, setMode] = useState<RegMode>("single");
  const [groupSize, setGroupSize] = useState<4 | 5>(4);
  const [pricingFees, setPricingFees] = useState<PaymentFee[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [showPendingRegistrations, setShowPendingRegistrations] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selectedPendingReg, setSelectedPendingReg] = useState<Registration | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [sendingPaymentLink, setSendingPaymentLink] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    fetchPricing();
    fetchEvents();
    fetchPendingRegistrations();
    return () => { document.title = "The Summit LLP"; };
  }, []);

  const fetchPricing = async () => {
    try {
      setLoadingPricing(true);
      const response = await pricingApi.getAll(true);
      setPricingFees(response.data || []);
    } catch (error) {
      console.error("Error fetching pricing:", error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await eventApi.getAll();
      if (response.success && response.data) {
        setEvents(response.data);
        // Auto-select first event if available
        if (response.data.length > 0) {
          setSelectedEventId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      setLoadingPending(true);
      const response = await participantsApi.getAll();
      if (response.success && response.data) {
        // Filter pending registrations
        const pending = response.data.filter(
          (p: any) => p.paymentStatus === "pending"
        ).map((p: any) => ({
          _id: p._id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          eventId: p.eventId?._id || p.eventId,
          eventName: p.eventId?.eventName || "Unknown Event",
          paymentStatus: p.paymentStatus,
          registrationFee: p.registraionFee || 0,
          createdAt: p.createdAt,
          isStudent: p.isStudent,
          isGroup: p.isGroup,
        }));
        setPendingRegistrations(pending);
      }
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    designation: "", organization: "",
    college: "", course: "", yearOfStudy: "", studentId: "",
    notes: "",
  });

  const [groupMembers, setGroupMembers] = useState<{ name: string; email: string; phone: string }[]>(
    Array.from({ length: 3 }, () => ({ name: "", email: "", phone: "" }))
  );

  const getPrice = () => {
    // Use event-based pricing instead of old pricing structure
    const event = events.find(e => e._id === selectedEventId);
    if (!event || !event.registrationFee) return 0;
    
    if (type === "professional") {
      return event.registrationFee.professional_individuals;
    } else {
      return mode === "single" 
        ? event.registrationFee.student_individuals 
        : event.registrationFee.student_group_per_head * groupSize;
    }
  };

  const getEventRegistrationFee = () => {
    const event = events.find(e => e._id === selectedEventId);
    if (!event || !event.registrationFee) return 0;
    
    if (type === "professional") {
      return event.registrationFee.professional_individuals;
    } else {
      return mode === "single" 
        ? event.registrationFee.student_individuals 
        : event.registrationFee.student_group_per_head * groupSize;
    }
  };

  const adjustGroupSize = (delta: number) => {
    const newSize = (groupSize + delta) as 4 | 5;
    if (newSize < 4 || newSize > 5) return;
    setGroupSize(newSize);
    const additionalMembers = newSize - 1;
    setGroupMembers((prev) => {
      if (prev.length < additionalMembers) {
        return [...prev, ...Array.from({ length: additionalMembers - prev.length }, () => ({ name: "", email: "", phone: "" }))];
      }
      return prev.slice(0, additionalMembers);
    });
  };

  const updateMember = (index: number, field: string, value: string) => {
    setGroupMembers((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      toast.error("Please select an event.");
      return;
    }
    
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
      const incomplete = groupMembers.some((m) => !m.name.trim() || !m.email.trim());
      if (incomplete) { toast.error("Please fill all group member details."); return; }
    }

    setSubmitting(true);
    try {
      const event = events.find(e => e._id === selectedEventId);
      const registrationFee = getEventRegistrationFee();
      
      let response;
      const commonData = {
        eventId: selectedEventId,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        registrationFee,
      };

      if (type === "student") {
        if (mode === "single") {
          response = await participantsApi.registerStudentIndividual({
            ...commonData,
            collageName: form.college,
            course: form.course,
          });
        } else {
          const members: IMember[] = groupMembers.map(m => ({
            full_name: m.name,
            email: m.email,
            phone: m.phone,
          }));
          response = await participantsApi.registerStudentGroup({
            ...commonData,
            collageName: form.college,
            course: form.course,
            members,
          });
        }
      } else {
        response = await participantsApi.registerProfessional({
          ...commonData,
          designation: form.designation,
          organization: form.organization,
          yearsOfExperience: 0,
        });
      }

      if (response.success && response.data) {
        const newReg: Registration = {
          _id: response.data._id,
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          eventId: selectedEventId,
          eventName: event?.eventName || "Unknown",
          paymentStatus: "pending",
          registrationFee,
          createdAt: new Date().toISOString(),
          isStudent: type === "student",
          isGroup: mode === "group",
        };
        
        setCreatedRegistration(newReg);
        setShowPaymentModal(true);
        
        // Reset form
        setForm({ name: "", email: "", phone: "", designation: "", organization: "", college: "", course: "", yearOfStudy: "", studentId: "", notes: "" });
        setGroupMembers(Array.from({ length: 3 }, () => ({ name: "", email: "", phone: "" })));
        setMode("single");
        
        // Refresh pending list
        fetchPendingRegistrations();
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error?.response?.data?.message || "Failed to create registration");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdRegistration) return;
    
    try {
      await participantsApi.updatePaymentStatus(createdRegistration._id, "paid");
      toast.success("Payment confirmed successfully!");
      setShowPaymentModal(false);
      setCreatedRegistration(null);
      fetchPendingRegistrations();
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Failed to confirm payment");
    }
  };

  const handleSendPaymentLink = async (registration: Registration) => {
    setSendingPaymentLink(true);
    try {
      await participantsApi.sendPaymentLink(registration._id);
      toast.success("Payment link sent successfully!");
    } catch (error) {
      console.error("Error sending payment link:", error);
      toast.error("Failed to send payment link");
    } finally {
      setSendingPaymentLink(false);
    }
  };

  const handleUpdateStatus = async (registration: Registration, newStatus: "paid" | "pending" | "refunded" | "unpaid" | "processed") => {
    setUpdatingStatus(true);
    try {
      await participantsApi.updatePaymentStatus(registration._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setShowViewModal(false);
      fetchPendingRegistrations();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelBooking = async (registration: Registration) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await participantsApi.delete(registration._id);
      toast.success("Booking cancelled successfully");
      setShowViewModal(false);
      fetchPendingRegistrations();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const openViewModal = (reg: Registration) => {
    setSelectedPendingReg(reg);
    setShowViewModal(true);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  const price = getEventRegistrationFee();
  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Register User</h1>
          <p className="text-muted-foreground text-sm mt-1">Manually register a participant for an event</p>
        </div>
        <button
          onClick={() => setShowPendingRegistrations(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors"
        >
          <CreditCard size={18} />
          Pending Payments ({pendingRegistrations.length})
        </button>
      </div>

      {/* Event Selection */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-muted-foreground mb-2">Select Event *</label>
        {loadingEvents ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading events...
          </div>
        ) : (
          <select
            className={inputClass}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">Select an event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedEvent && (
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground">{selectedEvent.eventName}</p>
          <p className="text-xs text-muted-foreground">
            {selectedEvent.capacity 
              ? `${selectedEvent.seatsRemaining} seats remaining out of ${selectedEvent.capacity}`
              : "Unlimited seats available"
            }
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Type toggle */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Registrant Type</label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(["professional", "student"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  if (t === "professional") {
                    setMode("single");
                  }
                }}
                className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all ${type === t ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle - Only for students */}
        {type === "student" && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Registration Mode</label>
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button type="button" onClick={() => setMode("single")}
                className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === "single" ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <User size={15} /> Single
              </button>
              <button type="button" onClick={() => { setMode("group"); setGroupSize(4); setGroupMembers(Array.from({ length: 3 }, () => ({ name: "", email: "", phone: "" }))); }}
                className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${mode === "group" ? "gradient-gold text-emerald-dark" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <Users size={15} /> Group
              </button>
            </div>
          </div>
        )}

        {/* Group size - Only for students */}
        {type === "student" && mode === "group" && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <span className="text-sm font-medium text-foreground">Group Size</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => adjustGroupSize(-1)} disabled={groupSize <= 4} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"><Minus size={14} /></button>
              <span className="font-serif text-lg font-bold text-foreground w-8 text-center">{groupSize}</span>
              <button type="button" onClick={() => adjustGroupSize(1)} disabled={groupSize >= 5} className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"><Plus size={14} /></button>
              <span className="text-xs text-muted-foreground">members</span>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border border-border">
          <span className="text-sm text-muted-foreground">
            {type === "professional" 
              ? "Registration Fee" 
              : mode === "single" 
                ? "Registration Fee" 
                : `Group of ${groupSize} — Total`}
          </span>
          {loadingPricing ? (
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          ) : (
            <span className="font-serif text-xl font-bold text-gold">₹{price.toLocaleString()}</span>
          )}
        </div>

        {/* Lead registrant */}
        <div className="space-y-4">
          {type === "student" && mode === "group" && <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lead Registrant</p>}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
            <input required className={inputClass} placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
              <input required type="email" className={inputClass} placeholder="email@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone *</label>
              <input required type="tel" className={inputClass} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Conditional fields */}
        {type === "professional" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Designation *</label>
                <input required className={inputClass} placeholder="e.g. Quality Manager" value={form.designation} onChange={(e) => update("designation", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Organization *</label>
                <input required className={inputClass} placeholder="Hospital / Organization" value={form.organization} onChange={(e) => update("organization", e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">College *</label>
                <input required className={inputClass} placeholder="College / University" value={form.college} onChange={(e) => update("college", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Course *</label>
                <input required className={inputClass} placeholder="e.g. MBBS, MHA" value={form.course} onChange={(e) => update("course", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Year of Study</label>
                <select className={inputClass} value={form.yearOfStudy} onChange={(e) => update("yearOfStudy", e.target.value)}>
                  <option value="">Select</option>
                  {["1st", "2nd", "3rd", "4th", "5th"].map((y) => <option key={y} value={y}>{y} Year</option>)}
                  <option value="pg">Post-Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Student ID</label>
                <input className={inputClass} placeholder="ID number" value={form.studentId} onChange={(e) => update("studentId", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Group members - Only for students */}
        {type === "student" && mode === "group" && (
          <div className="space-y-4">
            {groupMembers.map((member, i) => (
              <div key={i} className="bg-muted/20 rounded-lg p-4 space-y-3 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Member {i + 2}</p>
                <input className={inputClass} placeholder="Full name *" value={member.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Email *" value={member.email} onChange={(e) => updateMember(i, "email", e.target.value)} />
                  <input className={inputClass} placeholder="Phone" value={member.phone} onChange={(e) => updateMember(i, "phone", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Admin Notes</label>
          <input className={inputClass} placeholder="Optional notes..." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>

        <button 
          type="submit" 
          disabled={submitting || !selectedEventId}
          className="w-full py-3 rounded-lg gradient-gold text-emerald-dark font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
          ) : (
            <><Save size={16} /> Register — ₹{price.toLocaleString()}</>
          )}
        </button>
      </form>

      {/* Payment Confirmation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Registration Created
            </DialogTitle>
            <DialogDescription>
              Registration created with pending payment status.
            </DialogDescription>
          </DialogHeader>

          {createdRegistration && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{createdRegistration.full_name}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{createdRegistration.email}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Event:</span> <span className="font-medium">{createdRegistration.eventName}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Amount:</span> <span className="font-medium text-gold">₹{createdRegistration.registrationFee.toLocaleString()}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Status:</span> <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded text-xs">Pending</span></p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Confirm Payment
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pending Registrations Modal */}
      <Dialog open={showPendingRegistrations} onOpenChange={setShowPendingRegistrations}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              Pending Payment Registrations
            </DialogTitle>
            <DialogDescription>
              Manage registrations awaiting payment confirmation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {loadingPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            ) : pendingRegistrations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending registrations</p>
            ) : (
              pendingRegistrations.map((reg) => (
                <div key={reg._id} className="bg-muted p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{reg.full_name}</p>
                    <p className="text-sm text-muted-foreground">{reg.email}</p>
                    <p className="text-xs text-muted-foreground">{reg.eventName}</p>
                    <p className="text-sm text-gold font-medium mt-1">₹{reg.registrationFee.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendPaymentLink(reg)}
                      disabled={sendingPaymentLink}
                      className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                      title="Send Payment Link"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => openViewModal(reg)}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Registration Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>

          {selectedPendingReg && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedPendingReg.full_name}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selectedPendingReg.email}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedPendingReg.phone}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Event:</span> <span className="font-medium">{selectedPendingReg.eventName}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Amount:</span> <span className="font-medium text-gold">₹{selectedPendingReg.registrationFee.toLocaleString()}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Type:</span> <span className="font-medium">{selectedPendingReg.isStudent ? "Student" : "Professional"} {selectedPendingReg.isGroup ? "(Group)" : ""}</span></p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Change Status:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedPendingReg, "paid")}
                    disabled={updatingStatus}
                    className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPendingReg, "processed")}
                    disabled={updatingStatus}
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Mark Processed
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => handleCancelBooking(selectedPendingReg)}
                  className="w-full py-2.5 rounded-lg border border-destructive text-destructive text-sm hover:bg-destructive/10 transition-colors"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegisterUser;
