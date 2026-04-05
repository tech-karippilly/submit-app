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
    speakerName?: string;
    speakerImage?: string;
    speakerTopic?: string;
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

  // Summit logo URL - using Cloudinary for reliable email delivery
  const summitLogoUrl = 'https://res.cloudinary.com/dsjvwhngp/image/upload/v1775418686/submit-project/branding/summit-logo.png';

  // Speaker image HTML if available
  const speakerSection = data.speakerImage ? `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${data.speakerImage}" alt="${data.speakerName || 'Speaker'}" 
        style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #D4AF37;" />
      ${data.speakerName ? `<p style="margin: 10px 0 5px; color: #1a3a2f; font-weight: 600;">${data.speakerName}</p>` : ''}
      ${data.speakerTopic ? `<p style="margin: 0; color: #D4AF37; font-size: 14px;">${data.speakerTopic}</p>` : ''}
    </div>
  ` : '';

  // Build combined HTML content with Summit theme
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header with Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #1a3a2f 0%, #0d1f1a 100%); padding: 30px; text-align: center;">
                  <img src="${summitLogoUrl}" alt="The Summit" style="width: 80px; height: 80px; border-radius: 8px;" />
                  <h1 style="color: #D4AF37; margin: 15px 0 0; font-size: 24px; font-weight: 600;">Registration Confirmed!</h1>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Dear <strong>${data.name}</strong>,
                  </p>
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                    Great news! Your registration for <strong style="color: #1a3a2f;">${data.eventName}</strong> has been confirmed and your payment has been received.
                  </p>
                  
                  <!-- Speaker Section -->
                  ${speakerSection}
                  
                  <!-- Event Details -->
                  <div style="background-color: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <h2 style="color: #1a3a2f; margin: 0 0 15px; font-size: 18px;">Event Details</h2>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr><td style="color: #666; width: 100px;"><strong>Event:</strong></td><td style="color: #333;">${data.eventName}</td></tr>
                      <tr><td style="color: #666;"><strong>Date:</strong></td><td style="color: #333;">${data.eventDate}</td></tr>
                      <tr><td style="color: #666;"><strong>Time:</strong></td><td style="color: #333;">${data.eventTime}</td></tr>
                      <tr><td style="color: #666;"><strong>Location:</strong></td><td style="color: #333;">${data.eventLocation}</td></tr>
                      <tr><td style="color: #666;"><strong>Registration ID:</strong></td><td style="color: #D4AF37; font-weight: 600;">${data.registrationId}</td></tr>
                    </table>
                  </div>
                  
                  <!-- Payment Details -->
                  <div style="background-color: #f8f9fa; border-left: 4px solid #10B981; padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <h2 style="color: #1a3a2f; margin: 0 0 15px; font-size: 18px;">Payment Details</h2>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr><td style="color: #666; width: 100px;"><strong>Amount Paid:</strong></td><td style="color: #10B981; font-weight: 600;">Rs. ${data.amount}</td></tr>
                      <tr><td style="color: #666;"><strong>Invoice #:</strong></td><td style="color: #333;">${data.invoiceNumber}</td></tr>
                      <tr><td style="color: #666;"><strong>Payment Date:</strong></td><td style="color: #333;">${data.transactionDate}</td></tr>
                    </table>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    Your invoice is attached to this email. Please keep it for your records.
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 25px 0 0;">
                    We look forward to seeing you at the event!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1a3a2f; padding: 20px; text-align: center;">
                  <p style="color: #D4AF37; margin: 0; font-size: 14px;">Best regards,</p>
                  <p style="color: #ffffff; margin: 5px 0 0; font-size: 16px; font-weight: 600;">Summit Team</p>
                  <p style="color: #888; margin: 10px 0 0; font-size: 12px;">
                    <a href="mailto:info@thesummitllp.com" style="color: #D4AF37; text-decoration: none;">info@thesummitllp.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
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

/**
 * Send refund confirmation email to participant
 */
export const sendRefundConfirmationEmail = async (
  to: string,
  refundData: {
    name: string;
    eventName: string;
    amount: number;
    reason: string;
    transactionId: string;
    refundDate: string;
  }
): Promise<SendEmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a4d3e 0%, #2d6a4f 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Summit</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0;">Refund Confirmation</p>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <h2 style="color: #1a4d3e; margin-top: 0;">Refund Processed Successfully</h2>
        
        <p style="color: #333333;">Dear ${refundData.name},</p>
        
        <p style="color: #333333;">Your refund has been processed successfully. Please find the details below:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Event:</td>
              <td style="padding: 8px 0; font-weight: bold;">${refundData.eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Refund Amount:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #dc3545;">₹${refundData.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Reason:</td>
              <td style="padding: 8px 0;">${refundData.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
              <td style="padding: 8px 0; font-family: monospace;">${refundData.transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Refund Date:</td>
              <td style="padding: 8px 0;">${refundData.refundDate}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #333333;">The refund amount will be credited to your original payment method within 5-7 business days.</p>
        
        <p style="color: #666666; margin-top: 30px;">
          If you have any questions, please contact us at ${INFO_EMAIL}.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            Best regards,<br>
            Summit Team
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Refund Confirmation - ${refundData.eventName}`,
    html,
  });
};

interface PaymentLinkData {
  name: string;
  eventName: string;
  amount: number;
  paymentLink: string;
}

export const sendPaymentLinkEmail = async (
  to: string,
  paymentData: PaymentLinkData
): Promise<SendEmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; margin: 0; font-size: 24px;">Complete Your Registration</h1>
        </div>
        
        <p style="color: #333333; font-size: 16px;">Dear ${paymentData.name},</p>
        
        <p style="color: #333333;">Thank you for registering for <strong>${paymentData.eventName}</strong>. Your registration is pending payment.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #333;"><strong>Registration Details:</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Event:</td>
              <td style="padding: 8px 0; font-weight: 600;">${paymentData.eventName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount Due:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #059669;">₹${paymentData.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentData.paymentLink}" 
             style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Complete Payment
          </a>
        </div>
        
        <p style="color: #666666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${paymentData.paymentLink}" style="color: #059669; word-break: break-all;">${paymentData.paymentLink}</a>
        </p>
        
        <p style="color: #666666; margin-top: 30px;">
          If you have any questions, please contact us at ${INFO_EMAIL}.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            Best regards,<br>
            Summit Team
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Complete Your Payment - ${paymentData.eventName}`,
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
  sendRefundConfirmationEmail,
  sendPaymentLinkEmail,
  verifyEmailConnection,
};
