import { useEffect, useState } from "react";
import { Save, Loader2, MapPin, Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";
import { contactApi, Contact } from "@/services/contact.services";

const PAGE_TITLE = "Manage Contact Details";

const defaultContact: Contact = {
  _id: "",
  name: "The Summit LLP",
  email: "info@thesummitllp.com",
  phone: "+91 XXX XXX XXXX",
  addressOne: "",
  addressTwo: "",
  city: "",
  state: "",
  pinCode: "",
  googleLocation: "",
  about: "",
  createdAt: "",
  updatedAt: "",
};

const AdminContact = () => {
  const [contact, setContact] = useState<Contact>(defaultContact);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `${PAGE_TITLE} | The Summit LLP`;
    return () => {
      document.title = "The Summit LLP";
    };
  }, []);

  // Fetch contact data from API
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await contactApi.get();
        if (response.success && response.data) {
          setContact(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch contact data:", error);
        toast.error("Failed to load contact data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await contactApi.update({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        addressOne: contact.addressOne,
        addressTwo: contact.addressTwo,
        city: contact.city,
        state: contact.state,
        pinCode: contact.pinCode,
        googleLocation: contact.googleLocation,
        about: contact.about,
      });
      
      if (response.success) {
        setContact(response.data);
        toast.success("Contact details updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save contact data:", error);
      toast.error("Failed to save contact data");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow";

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
          <h1 className="font-serif text-3xl font-bold text-foreground">Contact Details</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your organization&apos;s contact information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Organization Info */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Building className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-foreground">Organization Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Organization Name <span className="text-destructive">*</span>
              </label>
              <input 
                className={inputClass} 
                value={contact.name} 
                onChange={(e) => setContact({ ...contact, name: e.target.value })} 
                placeholder="e.g., The Summit LLP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  className={`${inputClass} pl-10`}
                  type="email"
                  value={contact.email} 
                  onChange={(e) => setContact({ ...contact, email: e.target.value })} 
                  placeholder="info@thesummitllp.com"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone <span className="text-destructive">*</span>
            </label>
            <div className="relative max-w-md">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                className={`${inputClass} pl-10`}
                value={contact.phone} 
                onChange={(e) => setContact({ ...contact, phone: e.target.value })} 
                placeholder="+91 XXX XXX XXXX"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <MapPin className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-foreground">Address</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Address Line 1 <span className="text-destructive">*</span>
              </label>
              <input 
                className={inputClass} 
                value={contact.addressOne} 
                onChange={(e) => setContact({ ...contact, addressOne: e.target.value })} 
                placeholder="Street address, building name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Address Line 2
              </label>
              <input 
                className={inputClass} 
                value={contact.addressTwo || ""} 
                onChange={(e) => setContact({ ...contact, addressTwo: e.target.value })} 
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  City <span className="text-destructive">*</span>
                </label>
                <input 
                  className={inputClass} 
                  value={contact.city} 
                  onChange={(e) => setContact({ ...contact, city: e.target.value })} 
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  State <span className="text-destructive">*</span>
                </label>
                <input 
                  className={inputClass} 
                  value={contact.state} 
                  onChange={(e) => setContact({ ...contact, state: e.target.value })} 
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  PIN Code <span className="text-destructive">*</span>
                </label>
                <input 
                  className={inputClass} 
                  value={contact.pinCode} 
                  onChange={(e) => setContact({ ...contact, pinCode: e.target.value })} 
                  placeholder="PIN Code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <MapPin className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-foreground">Google Maps Location</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Google Maps Embed URL
            </label>
            <input 
              className={inputClass} 
              value={contact.googleLocation || ""} 
              onChange={(e) => setContact({ ...contact, googleLocation: e.target.value })} 
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              Paste the Google Maps embed URL here. You can get this from Google Maps by clicking &quot;Share&quot; → &quot;Embed a map&quot;.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Building className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg font-bold text-foreground">About Organization</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              About Text <span className="text-destructive">*</span>
            </label>
            <textarea 
              rows={5} 
              className={inputClass} 
              value={contact.about} 
              onChange={(e) => setContact({ ...contact, about: e.target.value })} 
              placeholder="Brief description about your organization..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              This text will be displayed on the contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
