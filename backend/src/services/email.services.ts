import nodemailer, { Transporter } from 'nodemailer';
import { getEmailTemplateByType, processTemplate } from './emailTemplate.services';
import { EmailTemplateType } from '../models/EmailTemplate';
import { generateInvoicePDF, InvoicePDFData } from './pdfInvoice.services';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Info email for notifications
const INFO_EMAIL = process.env.INFO_EMAIL || 'info@summit.org.in';

// Create reusable transporter
const createTransporter = (): Transporter => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  };

  return nodemailer.createTransport(config);
};

// Verify transporter connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

// Send email
export const sendEmail = async (
  options: SendEmailOptions & { attachments?: SendEmailOptions['attachments'] }
): Promise<SendEmailResponse> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'No Reply'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Error sending email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Send email using template
export const sendTemplateEmail = async (
  to: string | string[],
  templateType: EmailTemplateType,
  variables: Record<string, string>,
  attachments?: SendEmailOptions['attachments']
): Promise<SendEmailResponse> => {
  try {
    const template = await getEmailTemplateByType(templateType);
    
    if (!template) {
      console.error(`Email template not found: ${templateType}`);
      return {
        success: false,
        error: `Email template not found: ${templateType}`,
      };
    }

    const { subject, htmlContent } = processTemplate(template, variables);

    return sendEmail({
      to,
      subject,
      html: htmlContent,
      attachments,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send template email';
    console.error('Error sending template email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Send registration email to participant
export const sendRegistrationEmailToParticipant = async (
  email: string,
  name: string,
  eventName: string,
  eventDate: string,
  eventLocation: string,
  registrationId: string
): Promise<SendEmailResponse> => {
  return sendTemplateEmail(email, 'registration', {
    name,
    eventName,
    eventDate,
    eventLocation,
    registrationId,
  });
};

// Send registration notification to info email
export const sendRegistrationNotificationToAdmin = async (
  participantData: {
    name: string;
    email: string;
    phone: string;
    eventName: string;
    eventDate: string;
    registrationId: string;
    registrationType: 'individual' | 'group';
    groupSize?: number;
    members?: { name: string; email: string }[];
  }
): Promise<SendEmailResponse> => {
  const { registrationType, groupSize, members, ...data } = participantData;
  
  let membersList = '';
  if (registrationType === 'group' && members && members.length > 0) {
    membersList = '<h3>Group Members:</h3><ul>' + 
      members.map(m => `<li>${m.name} (${m.email})</li>`).join('') +
      '</ul>';
  }

  const html = `
    <h1>New ${registrationType === 'group' ? 'Group ' : ''}Registration Received</h1>
    <h3>Participant Details</h3>
    <ul>
      <li><strong>Name:</strong> ${data.name}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Phone:</strong> ${data.phone}</li>
      <li><strong>Registration ID:</strong> ${data.registrationId}</li>
      ${registrationType === 'group' && groupSize ? `<li><strong>Group Size:</strong> ${groupSize}</li>` : ''}
    </ul>
    <h3>Event Details</h3>
    <ul>
      <li><strong>Event:</strong> ${data.eventName}</li>
      <li><strong>Date:</strong> ${data.eventDate}</li>
    </ul>
    ${membersList}
    <p>Please review the registration in the admin dashboard.</p>
  `;

  return sendEmail({
    to: INFO_EMAIL,
    subject: `New ${registrationType === 'group' ? 'Group ' : ''}Registration: ${data.eventName}`,
    html,
  });
};

// Send registration confirmation email (for initial registration - before payment)
// Send registration confirmation email (for initial registration - before payment)
export const sendConfirmationEmail = async (
  email: string,
  name: string,
  eventName: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  registrationId: string
): Promise<SendEmailResponse> => {
  return sendTemplateEmail(email, 'confirmation', {
    name,
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    registrationId,
  });
};

// Send payment confirmation email with registration details and PDF invoice (combined)
export const sendPaymentConfirmationWithInvoice = async (
  email: string,
  data: {
    name: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    registrationId: string;
    amount: string;
    invoiceNumber: string;
    transactionDate: string;
  },
  invoiceData?: InvoicePDFData
): Promise<SendEmailResponse> => {
  let attachments: SendEmailOptions['attachments'] = undefined;

  // Generate PDF invoice if data provided
  if (invoiceData) {
    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      attachments = [{
        filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }];
    } catch (error) {
      console.error('Failed to generate PDF invoice:', error);
      // Continue without attachment
    }
  }

  // Build combined HTML content
  const html = `
    <h1>Registration Confirmed!</h1>
    <p>Dear ${data.name},</p>
    <p>Great news! Your registration for <strong>${data.eventName}</strong> has been confirmed and your payment has been received.</p>
    
    <h2>Event Details</h2>
    <ul>
      <li><strong>Event:</strong> ${data.eventName}</li>
      <li><strong>Date:</strong> ${data.eventDate}</li>
      <li><strong>Time:</strong> ${data.eventTime}</li>
      <li><strong>Location:</strong> ${data.eventLocation}</li>
      <li><strong>Registration ID:</strong> ${data.registrationId}</li>
    </ul>
    
    <h2>Payment Details</h2>
    <ul>
      <li><strong>Amount Paid:</strong> Rs. ${data.amount}</li>
      <li><strong>Invoice Number:</strong> ${data.invoiceNumber}</li>
      <li><strong>Payment Date:</strong> ${data.transactionDate}</li>
    </ul>
    
    <p>Your invoice is attached to this email. Please keep it for your records.</p>
    
    <p>We look forward to seeing you at the event!</p>
    
    <p>Best regards,<br><strong>Summit Team</strong></p>
  `;

  return sendEmail({
    to: email,
    subject: `Registration Confirmed - ${data.eventName}`,
    html,
    attachments,
  });
};

// Send payment successful email with PDF invoice (legacy - kept for reference)
export const sendPaymentSuccessfulEmail = async (
  email: string,
  name: string,
  eventName: string,
  amount: string,
  paymentId: string,
  transactionDate: string,
  invoiceData?: InvoicePDFData
): Promise<SendEmailResponse> => {
  let attachments: SendEmailOptions['attachments'] = undefined;

  // Generate PDF invoice if data provided
  if (invoiceData) {
    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      attachments = [{
        filename: `Invoice-${invoiceData.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }];
    } catch (error) {
      console.error('Failed to generate PDF invoice:', error);
      // Continue without attachment
    }
  }

  return sendTemplateEmail(email, 'payment_successful', {
    name,
    eventName,
    amount,
    paymentId,
    transactionDate,
  }, attachments);
};

// Send cancellation email
export const sendCancellationEmail = async (
  email: string,
  name: string,
  eventName: string,
  eventDate: string,
  registrationId: string,
  cancellationReason: string
): Promise<SendEmailResponse> => {
  return sendTemplateEmail(email, 'cancellation', {
    name,
    eventName,
    eventDate,
    registrationId,
    cancellationReason,
  });
};

// Send enquiry notification to info email
export const sendEnquiryNotificationToAdmin = async (
  enquiryData: {
    name: string;
    email: string;
    phone?: string;
    title: string;
    description: string;
    eventName?: string;
    enquiryId: string;
  }
): Promise<SendEmailResponse> => {
  const html = `
    <h1>New Enquiry Received</h1>
    <h3>Enquirer Details</h3>
    <ul>
      <li><strong>Name:</strong> ${enquiryData.name}</li>
      <li><strong>Email:</strong> ${enquiryData.email}</li>
      ${enquiryData.phone ? `<li><strong>Phone:</strong> ${enquiryData.phone}</li>` : ''}
      <li><strong>Enquiry ID:</strong> ${enquiryData.enquiryId}</li>
    </ul>
    
    <h3>Enquiry Details</h3>
    <ul>
      <li><strong>Subject:</strong> ${enquiryData.title}</li>
      ${enquiryData.eventName ? `<li><strong>Related Event:</strong> ${enquiryData.eventName}</li>` : ''}
    </ul>
    
    <h3>Message</h3>
    <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${enquiryData.description}</p>
    
    <p>Please review and respond to this enquiry in the admin dashboard.</p>
  `;

  return sendEmail({
    to: INFO_EMAIL,
    subject: `New Enquiry: ${enquiryData.title}`,
    html,
  });
};

export default {
  sendEmail,
  sendTemplateEmail,
  sendRegistrationEmailToParticipant,
  sendRegistrationNotificationToAdmin,
  sendConfirmationEmail,
  sendPaymentConfirmationWithInvoice,
  sendPaymentSuccessfulEmail,
  sendCancellationEmail,
  sendEnquiryNotificationToAdmin,
  verifyEmailConnection,
};
