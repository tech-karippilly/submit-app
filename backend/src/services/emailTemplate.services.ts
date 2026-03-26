import { EmailTemplate, IEmailTemplate, EmailTemplateType } from '../models/EmailTemplate';

export interface CreateEmailTemplateInput {
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  variables?: string[];
}

export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  htmlContent?: string;
  variables?: string[];
  isActive?: boolean;
}

// Default templates
const defaultTemplates: CreateEmailTemplateInput[] = [
  {
    name: 'Registration Email',
    type: 'registration',
    subject: 'Registration Received - {{eventName}}',
    htmlContent: `<h1>Registration Received!</h1>
<p>Dear {{name}},</p>
<p>Thank you for registering for <strong>{{eventName}}</strong>.</p>
<h3>Event Details</h3>
<ul>
<li><strong>Event:</strong> {{eventName}}</li>
<li><strong>Date:</strong> {{eventDate}}</li>
<li><strong>Location:</strong> {{eventLocation}}</li>
<li><strong>Registration ID:</strong> {{registrationId}}</li>
</ul>
<p>We will send you a confirmation email once your registration is approved.</p>
<p>Best regards,<br><strong>Summit Team</strong></p>`,
    variables: ['name', 'eventName', 'eventDate', 'eventLocation', 'registrationId'],
  },
  {
    name: 'Confirmation Email',
    type: 'confirmation',
    subject: 'Registration Confirmed - {{eventName}}',
    htmlContent: `<h1>Registration Confirmed!</h1>
<p>Dear {{name}},</p>
<p>Great news! Your registration for <strong>{{eventName}}</strong> has been confirmed.</p>
<h3>Event Details</h3>
<ul>
<li><strong>Event:</strong> {{eventName}}</li>
<li><strong>Date:</strong> {{eventDate}}</li>
<li><strong>Time:</strong> {{eventTime}}</li>
<li><strong>Location:</strong> {{eventLocation}}</li>
<li><strong>Registration ID:</strong> {{registrationId}}</li>
</ul>
<p>We look forward to seeing you there!</p>
<p>Best regards,<br><strong>Summit Team</strong></p>`,
    variables: ['name', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'registrationId'],
  },
  {
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to Summit!',
    htmlContent: `<h1>Welcome, {{name}}!</h1>
<p>Thank you for joining Summit!</p>
<p>We're excited to have you as part of our community. Here's what you can do next:</p>
<ul>
<li>Browse our upcoming events</li>
<li>Connect with industry experts</li>
<li>Register for conferences and workshops</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team.</p>
<p>Best regards,<br><strong>Summit Team</strong></p>`,
    variables: ['name'],
  },
  {
    name: 'Cancellation Email',
    type: 'cancellation',
    subject: 'Registration Cancelled - {{eventName}}',
    htmlContent: `<h1>Registration Cancelled</h1>
<p>Dear {{name}},</p>
<p>Your registration for <strong>{{eventName}}</strong> has been cancelled.</p>
<h3>Details</h3>
<ul>
<li><strong>Event:</strong> {{eventName}}</li>
<li><strong>Date:</strong> {{eventDate}}</li>
<li><strong>Registration ID:</strong> {{registrationId}}</li>
<li><strong>Cancellation Reason:</strong> {{cancellationReason}}</li>
</ul>
<p>If you have any questions or would like to re-register, please contact our support team.</p>
<p>Best regards,<br><strong>Summit Team</strong></p>`,
    variables: ['name', 'eventName', 'eventDate', 'registrationId', 'cancellationReason'],
  },
  {
    name: 'Payment Successful Email',
    type: 'payment_successful',
    subject: 'Payment Successful - {{eventName}}',
    htmlContent: `<h1>Payment Successful!</h1>
<p>Dear {{name}},</p>
<p>Your payment for <strong>{{eventName}}</strong> has been successfully processed.</p>
<h3>Payment Details</h3>
<ul>
<li><strong>Event:</strong> {{eventName}}</li>
<li><strong>Amount Paid:</strong> Rs. {{amount}}</li>
<li><strong>Payment ID:</strong> {{paymentId}}</li>
<li><strong>Transaction Date:</strong> {{transactionDate}}</li>
</ul>
<p>Please keep this email as your receipt. You can also download your invoice from your dashboard.</p>
<p>Best regards,<br><strong>Summit Team</strong></p>`,
    variables: ['name', 'eventName', 'amount', 'paymentId', 'transactionDate'],
  },
];

// Seed default templates if they don't exist
export const seedDefaultTemplates = async (): Promise<void> => {
  for (const template of defaultTemplates) {
    const existing = await EmailTemplate.findOne({ type: template.type });
    if (!existing) {
      await EmailTemplate.create(template);
      console.log(`Created default email template: ${template.name}`);
    }
  }
};

// Create email template
export const createEmailTemplate = async (
  input: CreateEmailTemplateInput
): Promise<IEmailTemplate> => {
  const template = await EmailTemplate.create(input);
  return template;
};

// Get all email templates
export const getAllEmailTemplates = async (): Promise<IEmailTemplate[]> => {
  const templates = await EmailTemplate.find().sort({ createdAt: -1 });
  return templates;
};

// Get email template by ID
export const getEmailTemplateById = async (id: string): Promise<IEmailTemplate | null> => {
  const template = await EmailTemplate.findById(id);
  return template;
};

// Get email template by type
export const getEmailTemplateByType = async (
  type: EmailTemplateType
): Promise<IEmailTemplate | null> => {
  const template = await EmailTemplate.findOne({ type, isActive: true });
  return template;
};

// Update email template
export const updateEmailTemplate = async (
  id: string,
  input: UpdateEmailTemplateInput
): Promise<IEmailTemplate | null> => {
  const template = await EmailTemplate.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return template;
};

// Delete email template
export const deleteEmailTemplate = async (id: string): Promise<boolean> => {
  const template = await EmailTemplate.findById(id);
  if (!template) {
    return false;
  }
  await template.deleteOne();
  return true;
};

// Toggle template active status
export const toggleEmailTemplateStatus = async (
  id: string
): Promise<IEmailTemplate | null> => {
  const template = await EmailTemplate.findById(id);
  if (!template) {
    return null;
  }
  template.isActive = !template.isActive;
  await template.save();
  return template;
};

// Replace variables in template
export const processTemplate = (
  template: IEmailTemplate,
  variables: Record<string, string>
): { subject: string; htmlContent: string } => {
  let subject = template.subject;
  let htmlContent = template.htmlContent;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    htmlContent = htmlContent.replace(regex, value);
  }

  return { subject, htmlContent };
};
