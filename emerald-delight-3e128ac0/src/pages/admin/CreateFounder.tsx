import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  founderApi,
  Experience,
  Certification,
  CreateFounderRequest,
  UpdateFounderRequest,
} from "@/services/founder.services";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

interface FounderForm {
  fullName: string;
  title: string;
  professionalSummary: string;
  about: string;
  hospital: string;
  publications: string[];
  education: string[];
  experience: Experience[];
  certifications: Certification[];
  profileImage: {
    public_id: string;
    url: string;
  };
  type: 'Founder' | 'CoFounder';
}

const emptyForm: FounderForm = {
  fullName: "",
  title: "",
  professionalSummary: "",
  about: "",
  hospital: "",
  publications: [],
  education: [],
  experience: [],
  certifications: [],
  profileImage: { public_id: "", url: "" },
  type: "Founder",
};

const CreateFounder = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const typeFromQuery = searchParams.get("type") as "Founder" | "CoFounder" | null;

  const [form, setForm] = useState<FounderForm>(() => {
    if (typeFromQuery) {
      return { ...emptyForm, type: typeFromQuery };
    }
    return emptyForm;
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingExpImage, setUploadingExpImage] = useState<number | null>(null);
  const [uploadingCertImage, setUploadingCertImage] = useState<number | null>(null);

  const [newEducation, setNewEducation] = useState("");
  const [newPublication, setNewPublication] = useState("");
  const [newExp, setNewExp] = useState<Experience>({ name: "", description: "", experienceCertificateImageUrl: "" });
  const [newCert, setNewCert] = useState<Certification>({ title: "", description: "", certificateImage: "" });

  useEffect(() => {
    document.title = `${isEdit ? "Edit" : "Create"} Founder | The Summit LLP`;

    if (isEdit && id) {
      fetchFounder(id);
    }

    return () => {
      document.title = "The Summit LLP";
    };
  }, [id]);

  const fetchFounder = async (founderId: string) => {
    setLoading(true);
    try {
      const response = await founderApi.getById(founderId);
      const f = response.data;
      setForm({
        fullName: f.fullName,
        title: f.title,
        professionalSummary: f.professionalSummary,
        about: f.about,
        hospital: f.hospital,
        publications: f.publications || [],
        education: f.education || [],
        experience: f.experience || [],
        certifications: f.certifications || [],
        profileImage: f.profileImage || { public_id: "", url: "" },
        type: f.type,
      });
    } catch (error) {
      toast.error("Failed to fetch founder");
      navigate("/admin-dashboard/founder");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setForm({
          ...form,
          profileImage: {
            public_id: result.data.public_id,
            url: result.data.secure_url,
          },
        });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleExpImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingExpImage(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updatedExperience = [...form.experience];
        updatedExperience[index] = {
          ...updatedExperience[index],
          experienceCertificateImageUrl: result.data.secure_url,
        };
        setForm({ ...form, experience: updatedExperience });
        toast.success("Certificate uploaded successfully");
      } else {
        toast.error("Failed to upload certificate");
      }
    } catch (error) {
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingExpImage(null);
    }
  };

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingCertImage(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updatedCerts = [...form.certifications];
        updatedCerts[index] = {
          ...updatedCerts[index],
          certificateImage: result.data.secure_url,
        };
        setForm({ ...form, certifications: updatedCerts });
        toast.success("Certificate uploaded successfully");
      } else {
        toast.error("Failed to upload certificate");
      }
    } catch (error) {
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingCertImage(null);
    }
  };

  const handleNewExpImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingExpImage(-1);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setNewExp({ ...newExp, experienceCertificateImageUrl: result.data.secure_url });
        toast.success("Certificate uploaded successfully");
      } else {
        toast.error("Failed to upload certificate");
      }
    } catch (error) {
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingExpImage(null);
    }
  };

  const handleNewCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    setUploadingCertImage(-1);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_API_URL}/upload/image/single`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setNewCert({ ...newCert, certificateImage: result.data.secure_url });
        toast.success("Certificate uploaded successfully");
      } else {
        toast.error("Failed to upload certificate");
      }
    } catch (error) {
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingCertImage(null);
    }
  };

  const addEducation = () => {
    if (!newEducation.trim()) return;
    setForm({ ...form, education: [...form.education, newEducation.trim()] });
    setNewEducation("");
  };

  const removeEducation = (idx: number) => {
    setForm({ ...form, education: form.education.filter((_, i) => i !== idx) });
  };

  const addPublication = () => {
    if (!newPublication.trim()) return;
    setForm({ ...form, publications: [...form.publications, newPublication.trim()] });
    setNewPublication("");
  };

  const removePublication = (idx: number) => {
    setForm({ ...form, publications: form.publications.filter((_, i) => i !== idx) });
  };

  const addExperience = () => {
    if (!newExp.name.trim() || !newExp.description.trim()) return;
    setForm({ ...form, experience: [...form.experience, { ...newExp }] });
    setNewExp({ name: "", description: "", experienceCertificateImageUrl: "" });
  };

  const removeExperience = (idx: number) => {
    setForm({ ...form, experience: form.experience.filter((_, i) => i !== idx) });
  };

  const addCertification = () => {
    if (!newCert.title.trim() || !newCert.description.trim()) return;
    setForm({ ...form, certifications: [...form.certifications, { ...newCert }] });
    setNewCert({ title: "", description: "", certificateImage: "" });
  };

  const removeCertification = (idx: number) => {
    setForm({ ...form, certifications: form.certifications.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (form.education.length === 0) {
      toast.error("At least one education entry is required.");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && id) {
        const data: UpdateFounderRequest = {
          fullName: form.fullName,
          title: form.title,
          professionalSummary: form.professionalSummary,
          about: form.about,
          hospital: form.hospital,
          education: form.education,
          type: form.type,
          profileImage: form.profileImage.url ? form.profileImage : undefined,
          experience: form.experience,
          publications: form.publications,
          certifications: form.certifications,
        };
        await founderApi.update(id, data);
        toast.success(`${form.type} updated successfully!`);
      } else {
        const data: CreateFounderRequest = {
          fullName: form.fullName,
          title: form.title,
          professionalSummary: form.professionalSummary,
          about: form.about,
          hospital: form.hospital,
          education: form.education,
          type: form.type,
          profileImage: form.profileImage.url ? form.profileImage : undefined,
          experience: form.experience.length > 0 ? form.experience : undefined,
          publications: form.publications.length > 0 ? form.publications : undefined,
          certifications: form.certifications.length > 0 ? form.certifications : undefined,
        };
        await founderApi.create(data);
        toast.success(`${form.type} created successfully!`);
      }
      navigate("/admin-dashboard/founder");
    } catch (error) {
      toast.error(isEdit ? "Failed to update founder" : "Failed to create founder");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  if (loading && isEdit && !form.fullName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin-dashboard/founder")}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {isEdit ? `Edit ${form.type === 'CoFounder' ? 'Co-Founder' : 'Founder'}` : `Create ${form.type === 'CoFounder' ? 'Co-Founder' : 'Founder'}`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEdit ? `Update ${form.type === 'CoFounder' ? 'co-founder' : 'founder'} details` : `Add a new ${form.type === 'CoFounder' ? 'co-founder' : 'founder'}`}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Type *</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "Founder" })}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                form.type === "Founder"
                  ? "gradient-gold text-emerald-dark border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Founder
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "CoFounder" })}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                form.type === "CoFounder"
                  ? "gradient-gold text-emerald-dark border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Co-Founder
            </button>
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            {form.profileImage?.url ? (
              <img
                src={form.profileImage.url}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border">
                <ImageIcon size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {uploadingImage ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={15} /> Upload Image
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
              {form.profileImage?.url && (
                <button
                  onClick={() => setForm({ ...form, profileImage: { public_id: "", url: "" } })}
                  className="text-xs text-destructive hover:underline text-left"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, or WebP • Max 5 MB</p>
        </div>

        {/* Name & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
            <input
              className={inputClass}
              placeholder="Dr. Rajesh Kumar"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title / Designation</label>
            <input
              className={inputClass}
              placeholder="Founder & Managing Director"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Professional Summary</label>
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Brief professional summary..."
            value={form.professionalSummary}
            onChange={(e) => setForm({ ...form, professionalSummary: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">About</label>
          <textarea
            rows={5}
            className={inputClass}
            placeholder="Detailed about section..."
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Hospital</label>
          <input
            className={inputClass}
            placeholder="Apollo Hospitals, Fortis Healthcare..."
            value={form.hospital}
            onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          />
        </div>

        {/* Education */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Education *</label>
          <div className="space-y-2 mb-3">
            {form.education.map((edu, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2.5">
                <span className="text-gold text-xs">✦</span>
                <span className="flex-1 text-sm text-foreground">{edu}</span>
                <button onClick={() => removeEducation(i)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Add education (e.g., MBBS, MD, MPH)"
              value={newEducation}
              onChange={(e) => setNewEducation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEducation()}
            />
            <button
              onClick={addEducation}
              className="px-4 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Publications */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Publications</label>
          <div className="space-y-2 mb-3">
            {form.publications.map((pub, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-4 py-2.5">
                <span className="text-gold text-xs">✦</span>
                <span className="flex-1 text-sm text-foreground">{pub}</span>
                <button onClick={() => removePublication(i)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Add publication..."
              value={newPublication}
              onChange={(e) => setNewPublication(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPublication()}
            />
            <button
              onClick={addPublication}
              className="px-4 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Experience</label>
          <div className="space-y-4 mb-4">
            {form.experience.map((exp, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{exp.name}</h4>
                    <p className="text-xs text-muted-foreground">{exp.description}</p>
                  </div>
                  <button onClick={() => removeExperience(i)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                {exp.experienceCertificateImageUrl && (
                  <div className="mt-2">
                    <img
                      src={exp.experienceCertificateImageUrl}
                      alt="Certificate"
                      className="h-16 rounded border border-border"
                    />
                  </div>
                )}
                <div className="mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {uploadingExpImage === i ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={12} /> {exp.experienceCertificateImageUrl ? "Change" : "Upload"} Certificate
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleExpImageUpload(e, i)}
                      disabled={uploadingExpImage !== null}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Add new experience */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Add New Experience</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Experience name..."
                value={newExp.name}
                onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Description..."
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              {newExp.experienceCertificateImageUrl && (
                <img
                  src={newExp.experienceCertificateImageUrl}
                  alt="Certificate preview"
                  className="h-12 rounded border border-border"
                />
              )}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {uploadingExpImage === -1 ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={12} /> Upload Certificate
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleNewExpImageUpload}
                  disabled={uploadingExpImage !== null}
                />
              </label>
              {newExp.experienceCertificateImageUrl && (
                <button
                  onClick={() => setNewExp({ ...newExp, experienceCertificateImageUrl: "" })}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <button
              onClick={addExperience}
              disabled={!newExp.name.trim() || !newExp.description.trim()}
              className="px-4 py-2 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add Experience
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Certifications</label>
          <div className="space-y-4 mb-4">
            {form.certifications.map((cert, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{cert.title}</h4>
                    <p className="text-xs text-muted-foreground">{cert.description}</p>
                  </div>
                  <button onClick={() => removeCertification(i)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                {cert.certificateImage && (
                  <div className="mt-2">
                    <img
                      src={cert.certificateImage}
                      alt="Certificate"
                      className="h-16 rounded border border-border"
                    />
                  </div>
                )}
                <div className="mt-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {uploadingCertImage === i ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={12} /> {cert.certificateImage ? "Change" : "Upload"} Certificate
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleCertImageUpload(e, i)}
                      disabled={uploadingCertImage !== null}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Add new certification */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Add New Certification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Certification title..."
                value={newCert.title}
                onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Description..."
                value={newCert.description}
                onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              {newCert.certificateImage && (
                <img
                  src={newCert.certificateImage}
                  alt="Certificate preview"
                  className="h-12 rounded border border-border"
                />
              )}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {uploadingCertImage === -1 ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={12} /> Upload Certificate
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleNewCertImageUpload}
                  disabled={uploadingCertImage !== null}
                />
              </label>
              {newCert.certificateImage && (
                <button
                  onClick={() => setNewCert({ ...newCert, certificateImage: "" })}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <button
              onClick={addCertification}
              disabled={!newCert.title.trim() || !newCert.description.trim()}
              className="px-4 py-2 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Add Certification
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate("/admin-dashboard/founder")}
            className="flex-1 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? `Update ${form.type === 'CoFounder' ? 'Co-Founder' : 'Founder'}` : `Create ${form.type === 'CoFounder' ? 'Co-Founder' : 'Founder'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFounder;
