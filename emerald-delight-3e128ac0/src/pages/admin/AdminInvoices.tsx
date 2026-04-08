import { useEffect, useState } from "react";
import { Search, Download, Eye, Send, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { invoiceApi, Invoice, InvoiceStatus, InvoiceStats } from "@/services/invoice.services";

const PAGE_TITLE = "Invoice Management";

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  refunded: "bg-destructive/10 text-destructive",
};

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({ paid: 0, pending: 0, refunded: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    return () => { document.title = "The Summit LLP"; };
  }, []);

  // Fetch invoices and stats
  const fetchData = async () => {
    try {
      const [invoicesRes, statsRes] = await Promise.all([
        invoiceApi.getAll(),
        invoiceApi.getStats(),
      ]);
      
      if (invoicesRes.success) {
        setInvoices(invoicesRes.data || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = invoices.filter((inv) => {
    const matchSearch = 
      inv.name.toLowerCase().includes(search.toLowerCase()) || 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
      inv.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleRefund = async (id: string) => {
    if (!confirm("Are you sure you want to refund this invoice?")) return;
    
    setUpdatingId(id);
    try {
      const response = await invoiceApi.updateStatus(id, 'refunded');
      if (response.success) {
        setInvoices((prev) => prev.map((inv) => 
          inv._id === id ? { ...inv, status: 'refunded' as InvoiceStatus } : inv
        ));
        fetchData(); // Refresh stats
        toast.success("Invoice marked as refunded");
      }
    } catch (error) {
      console.error("Failed to refund invoice:", error);
      toast.error("Failed to process refund");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setUpdatingId(id);
    try {
      const response = await invoiceApi.updateStatus(id, 'paid');
      if (response.success) {
        setInvoices((prev) => prev.map((inv) => 
          inv._id === id ? { ...inv, status: 'paid' as InvoiceStatus } : inv
        ));
        fetchData(); // Refresh stats
        toast.success("Invoice marked as paid");
      }
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Failed to update invoice");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResend = (invoice: Invoice) => {
    // In a real app, this would send an email
    toast.success(`Invoice ${invoice.invoiceNumber} would be sent to ${invoice.email}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage invoices, refunds, and payment tracking</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Paid</p>
          <p className="font-serif text-2xl font-bold text-emerald-500 mt-1">₹{stats.paid.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="font-serif text-2xl font-bold text-amber-500 mt-1">₹{stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg gold-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Refunded</p>
          <p className="font-serif text-2xl font-bold text-destructive mt-1">₹{stats.refunded.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            className={`${inputClass} pl-10`} 
            placeholder="Search by name, email, or invoice number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <select 
          className={`${inputClass} w-auto`} 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg gold-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <>
                  <tr key={inv._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{inv.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{inv.email}</td>
                    <td className="px-4 py-3 text-foreground font-medium">₹{inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs capitalize rounded-full px-2.5 py-1 font-medium ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setExpandedId(expandedId === inv._id ? null : inv._id)} 
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                          title="View details"
                        >
                          {expandedId === inv._id ? <ChevronUp size={15} /> : <Eye size={15} />}
                        </button>
                        <button 
                          onClick={() => handleResend(inv)} 
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                          title="Resend invoice"
                        >
                          <Send size={15} />
                        </button>
                        {inv.status === "pending" && (
                          <button 
                            onClick={() => handleMarkPaid(inv._id)} 
                            disabled={updatingId === inv._id}
                            className="p-1.5 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors disabled:opacity-50" 
                            title="Mark as paid"
                          >
                            {updatingId === inv._id ? <Loader2 size={15} className="animate-spin" /> : "✓"}
                          </button>
                        )}
                        {inv.status === "paid" && (
                          <button 
                            onClick={() => handleRefund(inv._id)} 
                            disabled={updatingId === inv._id}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50" 
                            title="Issue refund"
                          >
                            {updatingId === inv._id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} className="rotate-180" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === inv._id && (
                    <tr key={`${inv._id}-details`} className="bg-muted/20">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Event</p>
                            <p className="text-foreground">{inv.eventId?.eventName || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="text-foreground capitalize">{inv.attendeeType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className="text-foreground">{formatDate(inv.dueDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-foreground">{inv.phone}</p>
                          </div>
                          {inv.isGroup && inv.groupSize && (
                            <div>
                              <p className="text-xs text-muted-foreground">Group Size</p>
                              <p className="text-foreground">{inv.groupSize} members</p>
                            </div>
                          )}
                          {inv.paidAt && (
                            <div>
                              <p className="text-xs text-muted-foreground">Paid On</p>
                              <p className="text-foreground">{formatDate(inv.paidAt)}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoices;
