import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  pricingApi,
  PaymentFee,
  CreatePaymentFeeRequest,
  UpdatePaymentFeeRequest,
  AttendeeType,
} from "@/services/pricing.services";

const emptyFee: CreatePaymentFeeRequest = {
  attendeeType: "professional",
  professional_individuals: 0,
  student_individuals: 0,
  student_group_per_head: 0,
};

const attendeeTypeLabels: Record<AttendeeType, string> = {
  professional: "Professional",
  student: "Student",
};

const CreatePricing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePaymentFeeRequest>({ ...emptyFee });

  useEffect(() => {
    document.title = isEditing ? "Edit Pricing | The Summit LLP" : "Add Pricing | The Summit LLP";
    
    if (id) {
      fetchPricing(id);
    }
    
    return () => {
      document.title = "The Summit LLP";
    };
  }, [id]);

  const fetchPricing = async (pricingId: string) => {
    try {
      setLoading(true);
      const response = await pricingApi.getById(pricingId);
      setFormData({
        attendeeType: response.data.attendeeType,
        professional_individuals: response.data.professional_individuals || 0,
        student_individuals: response.data.student_individuals || 0,
        student_group_per_head: response.data.student_group_per_head || 0,
      });
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast.error("Failed to load pricing data");
      navigate("/admin-dashboard/pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate based on attendee type
    if (formData.attendeeType === "professional") {
      if (!formData.professional_individuals || formData.professional_individuals <= 0) {
        toast.error("Professional individual fee is required.");
        return;
      }
    } else {
      if (!formData.student_individuals || formData.student_individuals <= 0) {
        toast.error("Student individual fee is required.");
        return;
      }
      if (!formData.student_group_per_head || formData.student_group_per_head <= 0) {
        toast.error("Student group per head fee is required.");
        return;
      }
    }

    try {
      setSaving(true);
      if (isEditing && id) {
        await pricingApi.update(id, formData as UpdatePaymentFeeRequest);
        toast.success("Pricing updated successfully!");
      } else {
        await pricingApi.create(formData);
        toast.success("Pricing created successfully!");
      }
      navigate("/admin-dashboard/pricing");
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error(isEditing ? "Failed to update pricing" : "Failed to create pricing");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <button
        onClick={() => navigate("/admin-dashboard/pricing")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Pricing</span>
      </button>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {isEditing ? "Edit Pricing" : "Add New Pricing"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isEditing ? "Update pricing details" : "Create a new pricing plan for registrations"}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        {/* Attendee Type Selection */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">Attendee Type</h2>
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Select Type *
            </label>
            <select
              className={inputClass}
              value={formData.attendeeType}
              onChange={(e) =>
                setFormData({ ...formData, attendeeType: e.target.value as AttendeeType })
              }
            >
              {Object.entries(attendeeTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground border-b border-border pb-2">Fee Structure (₹)</h2>
          
          {formData.attendeeType === "professional" ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Professional Individual Fee *
              </label>
              <input
                type="number"
                className={inputClass}
                placeholder="2000"
                value={formData.professional_individuals || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    professional_individuals: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">Fee for individual professional registration</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Student Individual Fee *
                </label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="1000"
                  value={formData.student_individuals || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student_individuals: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">Fee for individual student registration</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Student Group Per Head Fee *
                </label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="500"
                  value={formData.student_group_per_head || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student_group_per_head: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">Per-head fee for student group registration (calculated as: fee × group size)</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={() => navigate("/admin-dashboard/pricing")}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={15} />}
            {isEditing ? "Update Pricing" : "Create Pricing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePricing;
