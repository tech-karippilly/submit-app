import { Request, Response, NextFunction } from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from '../services/enquiry.services';
import { sendEmail } from '../services/email.services';
import { Enquiry } from '../models/Enquiry';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enquiry = await createEnquiry(req.body);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.query;
    const enquiries = await getAllEnquiries(eventId as string | undefined);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await getEnquiryById(id);

    if (!enquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const enquiry = await updateEnquiry(id, req.body);

    if (!enquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteEnquiry(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send reply to enquiry via email
 */
export const sendReply = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { subject, content } = req.body;

    if (!subject || !content) {
      res.status(400).json({
        success: false,
        message: 'Subject and content are required',
      });
      return;
    }

    // Check if reply mail feature is enabled
    if (process.env.REPLY_MAIL !== 'true') {
      res.status(503).json({
        success: false,
        message: 'Reply mail function is not enabled yet',
      });
      return;
    }

    // Get enquiry details
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    // Send email
    const emailResult = await sendEmail({
      to: enquiry.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a4d3e 0%, #2d6a4f 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Summit</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">Response to Your Enquiry</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="color: #333333;">Dear ${enquiry.name},</p>
            
            <p style="color: #333333;">Thank you for contacting us. Please find our response to your enquiry below:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 5px 0;">Your Original Message:</p>
              <p style="color: #333333; font-weight: bold; margin: 0 0 10px 0;">${enquiry.title}</p>
              <p style="color: #666666; margin: 0;">${enquiry.description}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">Our Response:</p>
              <p style="color: #333333; margin: 0; line-height: 1.6;">${content.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p style="color: #666666; margin-top: 30px;">
              If you have any further questions, please don't hesitate to contact us.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Best regards,<br>
                Summit Team
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
    });
  } catch (error) {
    next(error);
  }
};
