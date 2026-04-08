import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2, Loader2, ToggleLeft, ToggleRight, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import {
  pricingApi,
  PaymentFee,
  AttendeeType,
} from "@/services/pricing.services";

const PAGE_TITLE = "Registration Pricing";

const attendeeTypeLabels: Record<AttendeeType, string> = {
  professional: "Professional",
  student: "Student",
};

const AdminPricing = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState<PaymentFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    fetchFees();
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await pricingApi.getAll();
      setFees(response.data || []);
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast.error("Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, index: number) => {
    try {
      const response = await pricingApi.toggleStatus(id);
      setFees(fees.map((f, i) => (i === index ? { ...f, isActive: response.data.isActive } : f)));
      toast.success(response.message);
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteFee = async (id: string, index: number) => {
    if (!confirm("Are you sure you want to delete this pricing?")) return;

    try {
      await pricingApi.delete(id);
      setFees(fees.filter((_, i) => i !== index));
      toast.success("Pricing deleted successfully");
    } catch (error) {
      console.error("Error deleting pricing:", error);
      toast.error("Failed to delete pricing");
    }
  };

  const groupedFees = fees.reduce((acc, fee) => {
    const key = fee.attendeeType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fee);
    return acc;
  }, {} as Record<AttendeeType, PaymentFee[]>);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Registration Pricing</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage registration fees for professionals and students</p>
        </div>
        <button
          onClick={() => navigate("/admin-dashboard/pricing/create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Pricing
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : fees.length === 0 ? (
        <div className="text-center py-20">
          <IndianRupee className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No pricing found. Create your first pricing plan!</p>
          <button
            onClick={() => navigate("/admin-dashboard/pricing/create")}
            className="px-4 py-2 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Add Pricing
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {(["professional", "student"] as AttendeeType[]).map((attendeeType) => {
            const typeFees = groupedFees[attendeeType] || [];
            if (typeFees.length === 0) return null;

            return (
              <div key={attendeeType}>
                <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  {attendeeTypeLabels[attendeeType]} Registration
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {typeFees.map((fee) => {
                    const globalIndex = fees.indexOf(fee);
                    return (
                      <div
                        key={fee._id}
                        className={`bg-card rounded-lg border p-5 transition-colors ${
                          fee.isActive ? "border-gold/30 hover:border-gold/50" : "border-border opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{attendeeTypeLabels[fee.attendeeType]} Pricing</h3>
                            <p className="text-xs text-muted-foreground">
                              {fee.attendeeType === "professional" ? "Individual Only" : "Individual & Group"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleStatus(fee._id, globalIndex)}
                              className={`p-1.5 rounded-md transition-colors ${
                                fee.isActive
                                  ? "text-gold hover:bg-gold/10"
                                  : "text-muted-foreground hover:bg-muted"
                              }`}
                              title={fee.isActive ? "Deactivate" : "Activate"}
                            >
                              {fee.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                              onClick={() => navigate(`/admin-dashboard/pricing/edit/${fee._id}`)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteFee(fee._id, globalIndex)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-3">
                          {fee.attendeeType === "professional" ? (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Individual Fee</span>
                              <span className="font-semibold text-foreground">₹{(fee.professional_individuals || 0).toLocaleString()}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Individual Fee</span>
                                <span className="font-semibold text-foreground">₹{(fee.student_individuals || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Group Per Head</span>
                                <span className="font-semibold text-foreground">₹{(fee.student_group_per_head || 0).toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              fee.isActive ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {fee.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
