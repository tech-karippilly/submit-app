import { useEffect, useState } from "react";
import { Search, Eye, Trash2, Loader2, Mail, Phone, Calendar, MessageSquare, Send, X } from "lucide-react";
import { toast } from "sonner";
import { enquiryApi, Enquiry } from "@/services/enquiry.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_TITLE = "Manage Enquiries";

const statusColors: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-400",
  Pending: "bg-gold/20 text-gold",
  Resolved: "bg-emerald-light/20 text-emerald-light",
  Closed: "bg-muted text-muted-foreground",
};

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Reply modal state
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [enquiryForReply, setEnquiryForReply] = useState<Enquiry | null>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  // Fetch enquiries from API
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await enquiryApi.getAll();
        if (response.success) {
          setEnquiries(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch enquiries:", error);
        toast.error("Failed to load enquiries");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const filtered = enquiries.filter((e) => {
    const matchSearch = 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    
    setDeletingId(id);
    try {
      const response = await enquiryApi.delete(id);
      if (response.success) {
        setEnquiries((prev) => prev.filter((e) => e._id !== id));
        setSelectedEnquiry(null);
        toast.success("Enquiry deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
      toast.error("Failed to delete enquiry");
    } finally {
      setDeletingId(null);
    }
  };

  const openReplyModal = (enquiry: Enquiry) => {
    setEnquiryForReply(enquiry);
    setReplySubject(`Re: ${enquiry.title}`);
    setReplyContent("");
    setShowReplyModal(true);
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setEnquiryForReply(null);
    setReplySubject("");
    setReplyContent("");
  };

  const sendReply = async () => {
    if (!enquiryForReply) return;
    
    if (!replySubject.trim() || !replyContent.trim()) {
      toast.error("Please enter both subject and content");
      return;
    }

    setSendingReply(true);
    try {
      // Call API to send reply email
      const response = await enquiryApi.sendReply(enquiryForReply._id, {
        subject: replySubject,
        content: replyContent,
      });

      if (response.success) {
        toast.success("Reply sent successfully");
        closeReplyModal();
        // Refresh enquiries to update status
        const refreshResponse = await enquiryApi.getAll();
        if (refreshResponse.success) {
          setEnquiries(refreshResponse.data || []);
        }
      } else {
        toast.error(response.message || "Failed to send reply");
      }
    } catch (error: any) {
      console.error("Failed to send reply:", error);
      const errorMessage = error?.response?.data?.message || "Failed to send reply";
      toast.error(errorMessage);
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">{enquiries.length} total enquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Name</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden md:table-cell">Email</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden lg:table-cell">Title</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden lg:table-cell">Event</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden md:table-cell">Date</th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <p className="text-sm font-medium text-foreground">{e.name}</p>
                  <p className="text-xs text-muted-foreground md:hidden">{e.email}</p>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{e.email}</td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{e.title}</td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                  {e.eventId?.title || <span className="text-muted-foreground/50">General</span>}
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{formatDate(e.createdAt)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedEnquiry(e)} 
                      className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => openReplyModal(e)} 
                      className="p-1.5 rounded-md hover:bg-gold/10 transition-colors text-muted-foreground hover:text-gold"
                      title="Reply"
                    >
                      <Mail size={16} />
                    </button>
                    <button 
                      onClick={() => deleteEnquiry(e._id)} 
                      disabled={deletingId === e._id}
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === e._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No enquiries found.</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEnquiry(null)}>
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">{selectedEnquiry.title}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors["New"]}`}>
                New
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="text-foreground">{selectedEnquiry.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="text-foreground">{selectedEnquiry.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Submitted On</p>
                  <p className="text-foreground">{formatDate(selectedEnquiry.createdAt)}</p>
                </div>
              </div>
              
              {selectedEnquiry.eventId && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Related Event</p>
                    <p className="text-foreground">{selectedEnquiry.eventId.title}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-border pt-4">
              <p className="text-muted-foreground text-xs mb-2">Message</p>
              <p className="text-sm text-foreground leading-relaxed">{selectedEnquiry.description}</p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  openReplyModal(selectedEnquiry);
                  setSelectedEnquiry(null);
                }}
                className="flex-1 py-2.5 rounded-lg bg-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Reply
              </button>
              <button 
                onClick={() => deleteEnquiry(selectedEnquiry._id)}
                disabled={deletingId === selectedEnquiry._id}
                className="flex-1 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {deletingId === selectedEnquiry._id ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </button>
              <button 
                onClick={() => setSelectedEnquiry(null)} 
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold" />
              Reply to Enquiry
            </DialogTitle>
            <DialogDescription>
              Send an email response to {enquiryForReply?.name} ({enquiryForReply?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Original Message Preview */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Original Message:</p>
              <p className="text-sm font-medium">{enquiryForReply?.title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{enquiryForReply?.description}</p>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Message *
              </label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeReplyModal}
              disabled={sendingReply}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={sendReply}
              disabled={sendingReply || !replySubject.trim() || !replyContent.trim()}
              className="px-4 py-2 bg-gold text-emerald-dark rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendingReply ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reply
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEnquiries;
