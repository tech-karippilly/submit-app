import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Events';
import {
  registerStudentIndividual,
  registerStudentGroup,
  registerProfessional,
  getAllParticipants,
  getParticipantsByEventId,
  getParticipantById,
  updatePaymentStatus,
  deleteParticipant,
  processRefund,
  sendPaymentLinkEmail,
} from '../services/participants.services';

/**
 * Unified registration endpoint
 * Handles: student individual, student group, and professional registrations
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      eventId,
      full_name,
      email,
      phone,
      designation,
      organization,
      yearsOfExperience,
      collageName,
      course,
      isStudent,
      isGroup,
      members,
      registrationFee,
    } = req.body;

    // Validate required fields
    if (!eventId || !full_name || !email || !phone) {
      res.status(400).json({
        success: false,
        message: 'Event ID, full name, email, and phone are required',
      });
      return;
    }

    // Ensure the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Invalid event ID. Please select a valid event.',
      });
      return;
    }

    if (registrationFee === undefined || registrationFee === null) {
      res.status(400).json({
        success: false,
        message: 'Registration fee is required',
      });
      return;
    }

    let participant;

    // Determine registration type and process accordingly
    if (isStudent) {
      // Student registration
      if (!collageName || !course) {
        res.status(400).json({
          success: false,
          message: 'College name and course are required for student registration',
        });
        return;
      }

      if (isGroup) {
        // Student group registration
        if (!members || !Array.isArray(members) || members.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Members list is required for group registration',
          });
          return;
        }

        participant = await registerStudentGroup({
          eventId,
          full_name,
          email,
          phone,
          collageName,
          course,
          members,
          registrationFee,
        });
      } else {
        // Student individual registration
        participant = await registerStudentIndividual({
          eventId,
          full_name,
          email,
          phone,
          collageName,
          course,
          registrationFee,
        });
      }
    } else {
      // Professional registration (individual only)
      if (!designation || !organization || yearsOfExperience === undefined) {
        res.status(400).json({
          success: false,
          message: 'Designation, organization, and years of experience are required for professional registration',
        });
        return;
      }

      participant = await registerProfessional({
        eventId,
        full_name,
        email,
        phone,
        designation,
        organization,
        yearsOfExperience,
        registrationFee,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all participants with pagination and filtering
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Date filter params
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        // Add one day to include the end date fully
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }

    const { participants, totalCount } = await getAllParticipants({
      skip,
      limit,
      dateFilter,
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      count: participants.length,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get participants by event ID
 */
export const getByEventId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const participants = await getParticipantsByEventId(eventId);

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get participant by ID
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const participant = await getParticipantById(id);

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Participant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment status
 */
export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      res.status(400).json({
        success: false,
        message: 'Payment status is required',
      });
      return;
    }

    const participant = await updatePaymentStatus(id, paymentStatus);

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Participant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: participant,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete participant
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteParticipant(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Participant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Participant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paid participants by event ID (for refunds)
 */
export const getPaidParticipantsByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { Participant } = await import('../models/Participants');
    
    const participants = await Participant.find({
      eventId: eventId,
      paymentStatus: 'paid',
    }).select('full_name email phone registraionFee paymentStatus createdAt');

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund for a participant
 */
export const refundParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Refund reason is required',
      });
      return;
    }

    const result = await processRefund(id, reason);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.transaction,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Send payment link email to participant
 */
export const sendPaymentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sendPaymentLinkEmail(id);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    next(error);
  }
};
