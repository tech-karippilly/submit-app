import { useEffect, useState, useCallback } from "react";
import { Search, Eye, Trash2, RefreshCw, ChevronLeft, ChevronRight, ChevronUp, Calendar, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { participantsApi, Participant, ParticipantsQueryParams } from "@/services/participants.services";

const PAGE_TITLE = "Registration Management";

const ITEMS_PER_PAGE = 10;

interface Registration {
  id: string;
  eventId?: string;
  eventName?: string;
  name: string;
  email: string;
  phone: string;
  type: "professional" | "student";
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: Participant["paymentStatus"];
  date: string;
  amount: number;
  designation?: string;
  organization?: string;
  experience?: string;
  college?: string;
  course?: string;
  yearOfStudy?: string;
  studentId?: string;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRegistrations = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const params: ParticipantsQueryParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await participantsApi.getAll(params);
      const mapped: Registration[] = res.data.map((p: Participant) => ({
        id: p._id,
        eventId: typeof p.eventId === "string" ? p.eventId : (p.eventId as any)?._id,
        eventName: typeof p.eventId === "object" ? (p.eventId as any)?.eventName : undefined,
        name: p.full_name,
        email: p.email,
        phone: p.phone,
        type: p.isStudent ? "student" : "professional",
        paymentStatus: p.paymentStatus,
        status:
          p.paymentStatus === "paid"
            ? "confirmed"
            : p.paymentStatus === "pending"
            ? "pending"
            : "cancelled",
        date: new Date(p.createdAt).toISOString().split("T")[0],
        amount: p.registraionFee || 0,
        designation: p.designation,
        organization: p.organization,
        experience: p.yearsOfExperience ? `${p.yearsOfExperience} years` : undefined,
        college: p.collageName,
        course: p.course,
      }));
      setRegistrations(mapped);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error loading registrations:", error);
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, startDate, endDate]);

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchRegistrations();
    return () => { document.title = "The Summit"; };
  }, [fetchRegistrations]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const handleRefresh = () => {
    fetchRegistrations(true);
  };
  
  const handleClearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const filtered = registrations.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType = filterType === "all" || r.type === filterType;
    const matchEvent = filterEvent === "all" || r.eventName === filterEvent;
    return matchSearch && matchStatus && matchType && matchEvent;
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel registration and mark as refunded?")) return;
    try {
      const res = await participantsApi.updatePaymentStatus(id, "refunded");
      const updated = res.data;
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                paymentStatus: updated.paymentStatus,
                status: updated.paymentStatus === "paid" ? "confirmed" : updated.paymentStatus === "pending" ? "pending" : "cancelled",
                amount: updated.registraionFee ?? r.amount,
              }
            : r
        )
      );
      toast.success(`Registration ${id} cancelled and refunded.`);
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error("Failed to cancel registration.");
    }
  };

  const totalRevenue = registrations.filter((r) => r.status === "confirmed").reduce((sum, r) => sum + r.amount, 0);
  const confirmedCount = registrations.filter((r) => r.status === "confirmed").length;
  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const eventNames = Array.from(new Set(registrations.map((r) => r.eventName).filter(Boolean) as string[]));

  const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Registrations</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage conference registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Confirmed</p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">{confirmedCount}</p>
        </div>
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="font-serif text-2xl font-bold text-foreground mt-1">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="font-serif text-2xl font-bold text-gold mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* First row: Search, Status, Type, Event filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className={`${inputClass} pl-10`} placeholder="Search by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className={`${inputClass} w-auto`} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="professional">Professional</option>
            <option value="student">Student</option>
          </select>
          <select className={`${inputClass} w-auto`} value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="all">All Events</option>
            {eventNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        {/* Second row: Date filters, Refresh, Export */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Date:</span>
          </div>
          <div className="flex gap-2 items-center flex-1">
            <input
              type="date"
              className={`${inputClass} w-auto`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              className={`${inputClass} w-auto`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To"
            />
            {(startDate || endDate) && (
              <button
                onClick={handleClearDateFilters}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear date filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {registrations.length} of {totalCount} registrations
        </p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg gold-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                  Loading registrations...
                </td></tr>
              ) : filtered.map((r) => (
                <>
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize bg-muted rounded px-2 py-1">{r.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs capitalize rounded-full px-2.5 py-1 font-medium ${statusColors[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground hidden lg:table-cell">₹{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View details">
                          {expandedId === r.id ? <ChevronUp size={15} /> : <Eye size={15} />}
                        </button>
                        <select
                          className="border border-border rounded px-1.5 py-1 text-xs bg-background text-foreground"
                          value={r.paymentStatus}
                          onChange={async (e) => {
                            const newStatus = e.target.value as Participant["paymentStatus"];
                            try {
                              const res = await participantsApi.updatePaymentStatus(r.id, newStatus);
                              const updated = res.data;
                              setRegistrations((prev) =>
                                prev.map((row) =>
                                  row.id === r.id
                                    ? {
                                        ...row,
                                        paymentStatus: updated.paymentStatus,
                                        status:
                                          updated.paymentStatus === "paid"
                                            ? "confirmed"
                                            : updated.paymentStatus === "pending"
                                            ? "pending"
                                            : "cancelled",
                                        amount: updated.registraionFee ?? row.amount,
                                      }
                                    : row
                                )
                              );
                              toast.success("Payment status updated");
                            } catch (error) {
                              console.error("Error updating payment status:", error);
                              toast.error("Failed to update payment status");
                            }
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="processed">Processed</option>
                          <option value="refunded">Refunded</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                        {r.paymentStatus !== "refunded" && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Cancel & refund registration"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr key={`${r.id}-details`} className="bg-muted/20">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-foreground">{r.phone}</p></div>
                          <div><p className="text-xs text-muted-foreground">Date</p><p className="text-foreground">{r.date}</p></div>
                          {r.type === "professional" ? (
                            <>
                              <div><p className="text-xs text-muted-foreground">Designation</p><p className="text-foreground">{r.designation}</p></div>
                              <div><p className="text-xs text-muted-foreground">Organization</p><p className="text-foreground">{r.organization}</p></div>
                            </>
                          ) : (
                            <>
                              <div><p className="text-xs text-muted-foreground">College</p><p className="text-foreground">{r.college}</p></div>
                              <div><p className="text-xs text-muted-foreground">Course</p><p className="text-foreground">{r.course} — {r.yearOfStudy} Year</p></div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No registrations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
