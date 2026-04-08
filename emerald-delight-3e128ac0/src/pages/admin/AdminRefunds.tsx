import { useState, useEffect } from "react";
import { RotateCcw, Loader2, Search, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { eventApi, Event } from "@/services/event.services";
import { participantsApi } from "@/services/participants.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_TITLE = "Refunds Management";

const AdminRefunds = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventApi.getAll();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    setSelectedEvent(eventId);
    if (!eventId) {
      setParticipants([]);
      return;
    }
    
    setIsLoadingParticipants(true);
    try {
      const response = await participantsApi.getPaidParticipantsByEvent(eventId);
      if (response.success && response.data) {
        setParticipants(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleRefundClick = (participant: any) => {
    setSelectedParticipant(participant);
    setRefundReason("");
    setShowConfirmModal(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedParticipant || !refundReason.trim()) {
      toast.error("Please provide a refund reason");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await participantsApi.processRefund(
        selectedParticipant._id,
        refundReason.trim()
      );

      if (response.success) {
        toast.success("Refund processed successfully");
        // Remove refunded participant from the list
        setParticipants(participants.filter(p => p._id !== selectedParticipant._id));
        setShowConfirmModal(false);
        setSelectedParticipant(null);
        setRefundReason("");
      } else {
        toast.error(response.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
          Refunds Management
        </h1>
        <p className="text-muted-foreground">
          Process refunds for cancelled events or participant requests
        </p>
      </div>

      {/* Event Selector */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => handleEventSelect(e.target.value)}
          className="w-full md:w-96 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          disabled={isLoading}
        >
          <option value="">Choose an event...</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {/* Participants List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Paid Participants</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search participants..."
                className="bg-transparent text-sm outline-none w-48"
              />
            </div>
          </div>
        </div>

        {isLoadingParticipants ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : !selectedEvent ? (
          <div className="text-center py-20 text-muted-foreground">
            <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an event to view paid participants</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No paid participants found for this event</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {participants.map((participant: any) => (
              <div
                key={participant._id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{participant.full_name}</p>
                  <p className="text-sm text-muted-foreground">{participant.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gold font-semibold">
                    ₹{participant.registraionFee?.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleRefundClick(participant)}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Confirm Refund
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The participant will be notified via email.
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <div className="py-4">
              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="font-medium">{selectedParticipant.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedParticipant.email}</p>
                <p className="text-gold font-semibold mt-2">
                  ₹{selectedParticipant.registraionFee?.toLocaleString()}
                </p>
              </div>
              
              <label className="block text-sm font-medium text-foreground mb-2">
                Refund Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px] resize-none"
              />
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRefund}
              disabled={isProcessing || !refundReason.trim()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Refund'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <div className="mt-6 bg-gold/5 border border-gold/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-gold mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">Refund Process</h3>
            <p className="text-sm text-muted-foreground mt-1">
              1. Select an event from the dropdown above<br />
              2. View all paid participants for that event<br />
              3. Click "Refund" and provide a reason<br />
              4. Confirm to process the refund and notify the participant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;
