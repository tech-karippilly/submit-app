import { useEffect, useState } from "react";
import { Mail, Edit2, Eye, Power, Loader2, X, Save, Image } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  emailTemplateApi,
  EmailTemplate,
  UpdateEmailTemplateRequest,
} from "@/services/emailTemplate.services";
import IconPicker from "@/components/IconPicker";

// Custom styles for Quill editor
const quillStyles = `
  .ql-container {
    font-family: inherit;
    font-size: 14px;
    min-height: 250px;
  }
  .ql-editor {
    min-height: 250px;
    padding: 15px;
  }
  .ql-toolbar {
    border-color: hsl(var(--border));
    border-radius: 8px 8px 0 0;
  }
  .ql-container {
    border-color: hsl(var(--border));
    border-radius: 0 0 8px 8px;
  }
  .ql-stroke {
    stroke: hsl(var(--foreground));
  }
  .ql-fill {
    fill: hsl(var(--foreground));
  }
  .ql-picker {
    color: hsl(var(--foreground));
  }
`;

const PAGE_TITLE = "Manage Email Templates";

const templateTypeLabels: Record<string, string> = {
  registration: "Registration Email",
  confirmation: "Confirmation Email",
  welcome: "Welcome Email",
  cancellation: "Cancellation Email",
  payment_successful: "Payment Successful Email",
};

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    subject: string;
    htmlContent: string;
  }>({
    name: "",
    subject: "",
    htmlContent: "",
  });

  useEffect(() => {
    document.title = PAGE_TITLE;
    fetchTemplates();
    return () => {
      document.title = "The Summit";
    };
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailTemplateApi.getAll();
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
    });
  };

  const openPreview = (template: EmailTemplate) => {
    setPreviewHtml(template.htmlContent);
  };

  const handleToggleStatus = async (template: EmailTemplate) => {
    try {
      setLoading(true);
      await emailTemplateApi.toggleStatus(template._id);
      toast.success(
        `Template ${template.isActive ? "deactivated" : "activated"} successfully`
      );
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling template status:", error);
      toast.error("Failed to toggle template status");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (!editForm.name.trim() || !editForm.subject.trim() || !editForm.htmlContent.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdateEmailTemplateRequest = {
        name: editForm.name,
        subject: editForm.subject,
        htmlContent: editForm.htmlContent,
      };
      await emailTemplateApi.update(editingTemplate._id, updateData);
      toast.success("Email template updated successfully");
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error updating email template:", error);
      toast.error("Failed to update email template");
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    // Simply append the variable to the content
    const currentContent = editForm.htmlContent;
    // Insert before the closing tags if any, otherwise append
    const insertion = `{{${variable}}}`;
    setEditForm({
      ...editForm,
      htmlContent: currentContent + insertion,
    });
  };

  const handleInsertIcon = (imageUrl: string, width?: number, height?: number) => {
    const imgTag = `<img src="${imageUrl}" alt="icon" width="${width || 100}" height="${height || 100}" style="max-width: 100%;" />`;
    setEditForm({
      ...editForm,
      htmlContent: editForm.htmlContent + imgTag,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="p-6 lg:p-10">
      <style>{quillStyles}</style>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Email Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage email templates for automated communications.
          </p>
        </div>
      </div>

      {loading && templates.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No email templates found. Restart the backend server to seed default
          templates.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {templates.map((template) => (
            <div
              key={template._id}
              className={`bg-card rounded-xl border border-border p-5 ${
                !template.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail
                      size={20}
                      className={
                        template.isActive ? "text-gold" : "text-muted-foreground"
                      }
                    />
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        template.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Type:{" "}
                    <span className="font-medium text-foreground">
                      {templateTypeLabels[template.type] || template.type}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Subject:{" "}
                    <span className="font-medium text-foreground">
                      {template.subject}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Variables:
                    </span>
                    {template.variables.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-foreground"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openPreview(template)}
                    className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEdit(template)}
                    className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(template)}
                    className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title={template.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power
                      size={18}
                      className={template.isActive ? "text-emerald-500" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditingTemplate(null)}
        >
          <div
            className="bg-card rounded-xl border border-border max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">
                Edit Email Template
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Template Name
                  </label>
                  <input
                    className={inputClass}
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Type
                  </label>
                  <input
                    className={`${inputClass} bg-muted cursor-not-allowed`}
                    value={templateTypeLabels[editingTemplate.type] || editingTemplate.type}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email Subject
                </label>
                <input
                  className={inputClass}
                  value={editForm.subject}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subject: e.target.value })
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Email Content
                  </label>
                </div>

                {/* Variable Buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs text-muted-foreground py-1">
                    Insert Variable:
                  </span>
                  {editingTemplate.variables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-xs font-mono text-foreground transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Image size={12} />
                    Insert Icon
                  </button>
                </div>

                {/* Rich Text Editor */}
                <div className="bg-white rounded-lg border border-border overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={editForm.htmlContent}
                    onChange={(value) =>
                      setEditForm({ ...editForm, htmlContent: value })
                    }
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ color: [] }, { background: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ align: [] }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    placeholder="Write your email content here..."
                    style={{ minHeight: "250px" }}
                  />
                </div>
              </div>

              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setPreviewHtml(editForm.htmlContent)}
                className="text-sm text-gold hover:underline"
              >
                Preview Current Content
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingTemplate(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg gradient-gold text-emerald-dark text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewHtml && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-card rounded-xl border border-border max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground">
                Email Preview
              </h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className="border border-border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={handleInsertIcon}
      />
    </div>
  );
};

export default AdminEmailTemplates;
