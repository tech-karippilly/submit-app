import mongoose from 'mongoose';
import { Participant, IParticipant, IMember } from '../models/Participants';
import { Event } from '../models/Events';
import { createInvoice } from './invoice.services';
import { createTransaction } from './transaction.services';
import {
  sendRegistrationNotificationToAdmin,
  sendPaymentConfirmationWithInvoice,
  sendRefundConfirmationEmail,
} from './email.services';
import { InvoicePDFData } from './pdfInvoice.services';

// Interface for student individual registration
export interface RegisterStudentIndividualInput {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  collageName: string;
  course: string;
  registrationFee: number;
}

// Interface for student group registration
export interface RegisterStudentGroupInput {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  collageName: string;
  course: string;
  members: IMember[];
  registrationFee: number;
}

// Interface for professional registration
export interface RegisterProfessionalInput {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  organization: string;
  yearsOfExperience: number;
  registrationFee: number;
}

// Union type for all registration types
export type RegisterParticipantInput =
  | RegisterStudentIndividualInput
  | RegisterStudentGroupInput
  | RegisterProfessionalInput;

/**
 * Check if event is expired
 */
const checkEventExpired = async (eventId: string): Promise<boolean> => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  return event.isExpired || false;
};

/**
 * Check if event is cancelled
 */
const checkEventCancelled = async (eventId: string): Promise<{ isCancelled: boolean; reason?: string }> => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  return {
    isCancelled: event.status === 'cancelled',
    reason: event.statusReason,
  };
};

/**
 * Check if participant already registered for the event
 */
const checkDuplicateRegistration = async (
  eventId: string,
  email: string,
  phone: string
): Promise<boolean> => {
  const existing = await Participant.findOne({
    eventId: new mongoose.Types.ObjectId(eventId),
    $or: [{ email: email.toLowerCase() }, { phone }],
  });
  return !!existing;
};

/**
 * Check if event has available seats
 */
const checkEventCapacity = async (
  eventId: string,
  requestedSeats: number = 1
): Promise<{ hasSeats: boolean; seatsRemaining: number | null; capacity: number | null }> => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (!event.capacity) {
    return { hasSeats: true, seatsRemaining: null, capacity: null };
  }
  
  const seatsRemaining = Math.max(0, event.capacity - (event.participantCount || 0));
  return { 
    hasSeats: seatsRemaining >= requestedSeats, 
    seatsRemaining, 
    capacity: event.capacity 
  };
};

/**
 * Register a student as an individual
 */
export const registerStudentIndividual = async (
  input: RegisterStudentIndividualInput
): Promise<IParticipant> => {
  // Check if event is expired
  const isExpired = await checkEventExpired(input.eventId);
  if (isExpired) {
    throw new Error('Registration closed: Event has already passed');
  }

  // Check if event is cancelled
  const { isCancelled, reason } = await checkEventCancelled(input.eventId);
  if (isCancelled) {
    throw new Error(`Registration closed: Event has been cancelled${reason ? `. Reason: ${reason}` : ''}`);
  }

  // Check for duplicate registration
  const isDuplicate = await checkDuplicateRegistration(
    input.eventId,
    input.email,
    input.phone
  );
  if (isDuplicate) {
    throw new Error('You have already registered for this event');
  }

  // Check event capacity
  const { hasSeats } = await checkEventCapacity(input.eventId, 1);
  if (!hasSeats) {
    throw new Error(`Sorry, this event is fully booked. No seats available.`);
  }

  const participant = await Participant.create({
    eventId: new mongoose.Types.ObjectId(input.eventId),
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    collageName: input.collageName,
    course: input.course,
    isStudent: true,
    isGroup: false,
    registraionFee: input.registrationFee,
    paymentStatus: 'pending',
  });
  
  // Increment participant count on the event
  await Event.findByIdAndUpdate(input.eventId, { $inc: { participantCount: 1 } });

  // Send notification to info email only (no email to participant until payment)
  try {
    const event = await Event.findById(input.eventId);
    if (event) {
      const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Send notification to info email
      await sendRegistrationNotificationToAdmin({
        name: participant.full_name,
        email: participant.email,
        phone: participant.phone,
        eventName: event.eventName,
        eventDate,
        registrationId: participant._id.toString(),
        registrationType: 'individual',
      });
    }
  } catch (emailError) {
    console.error('Failed to send registration notification:', emailError);
    // Don't fail registration if email fails
  }
  
  return participant;
};

/**
 * Register a student as a group
 */
export const registerStudentGroup = async (
  input: RegisterStudentGroupInput
): Promise<IParticipant> => {
  // Check if event is expired
  const isExpired = await checkEventExpired(input.eventId);
  if (isExpired) {
    throw new Error('Registration closed: Event has already passed');
  }

  // Check if event is cancelled
  const { isCancelled, reason } = await checkEventCancelled(input.eventId);
  if (isCancelled) {
    throw new Error(`Registration closed: Event has been cancelled${reason ? `. Reason: ${reason}` : ''}`);
  }

  // Check for duplicate registration (leader)
  const isDuplicate = await checkDuplicateRegistration(
    input.eventId,
    input.email,
    input.phone
  );
  if (isDuplicate) {
    throw new Error('You have already registered for this event');
  }

  // Check for duplicate members
  for (const member of input.members) {
    const memberDuplicate = await Participant.findOne({
      eventId: new mongoose.Types.ObjectId(input.eventId),
      $or: [
        { email: member.email.toLowerCase() },
        { phone: member.phone },
        { members: { $elemMatch: { email: member.email.toLowerCase() } } },
        { members: { $elemMatch: { phone: member.phone } } },
      ],
    });
    if (memberDuplicate) {
      throw new Error(`Member ${member.full_name} has already registered for this event`);
    }
  }

  // Check event capacity for group (leader + members)
  const groupSize = input.members.length + 1;
  const { hasSeats, seatsRemaining } = await checkEventCapacity(input.eventId, groupSize);
  if (!hasSeats) {
    throw new Error(`Sorry, not enough seats available. Only ${seatsRemaining} seat(s) remaining for this event.`);
  }

  const participant = await Participant.create({
    eventId: new mongoose.Types.ObjectId(input.eventId),
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    collageName: input.collageName,
    course: input.course,
    isStudent: true,
    isGroup: true,
    sizeOfGroup: input.members.length + 1, // +1 for the leader
    members: input.members,
    registraionFee: input.registrationFee,
    paymentStatus: 'pending',
  });
  
  // Increment participant count on the event
  await Event.findByIdAndUpdate(input.eventId, { $inc: { participantCount: 1 } });

  // Send notification to info email only (no email to participants until payment)
  try {
    const event = await Event.findById(input.eventId);
    if (event) {
      const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Send notification to info email about group registration
      await sendRegistrationNotificationToAdmin({
        name: participant.full_name,
        email: participant.email,
        phone: participant.phone,
        eventName: event.eventName,
        eventDate,
        registrationId: participant._id.toString(),
        registrationType: 'group',
        groupSize: input.members.length + 1,
        members: input.members.map(m => ({ name: m.full_name, email: m.email })),
      });
    }
  } catch (emailError) {
    console.error('Failed to send registration notification:', emailError);
    // Don't fail registration if email fails
  }
  
  return participant;
};

/**
 * Register a professional (individual only, no group)
 */
export const registerProfessional = async (
  input: RegisterProfessionalInput
): Promise<IParticipant> => {
  // Check if event is expired
  const isExpired = await checkEventExpired(input.eventId);
  if (isExpired) {
    throw new Error('Registration closed: Event has already passed');
  }

  // Check if event is cancelled
  const { isCancelled, reason } = await checkEventCancelled(input.eventId);
  if (isCancelled) {
    throw new Error(`Registration closed: Event has been cancelled${reason ? `. Reason: ${reason}` : ''}`);
  }

  // Check for duplicate registration
  const isDuplicate = await checkDuplicateRegistration(
    input.eventId,
    input.email,
    input.phone
  );
  if (isDuplicate) {
    throw new Error('You have already registered for this event');
  }

  // Check event capacity
  const { hasSeats } = await checkEventCapacity(input.eventId, 1);
  if (!hasSeats) {
    throw new Error(`Sorry, this event is fully booked. No seats available.`);
  }

  const participant = await Participant.create({
    eventId: new mongoose.Types.ObjectId(input.eventId),
    full_name: input.full_name,
    email: input.email,
    phone: input.phone,
    designation: input.designation,
    organization: input.organization,
    yearsOfExperience: input.yearsOfExperience,
    isStudent: false,
    isGroup: false,
    registraionFee: input.registrationFee,
    paymentStatus: 'pending',
  });
  
  // Increment participant count on the event
  await Event.findByIdAndUpdate(input.eventId, { $inc: { participantCount: 1 } });

  // Send notification to info email only (no email to participant until payment)
  try {
    const event = await Event.findById(input.eventId);
    if (event) {
      const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Send notification to info email
      await sendRegistrationNotificationToAdmin({
        name: participant.full_name,
        email: participant.email,
        phone: participant.phone,
        eventName: event.eventName,
        eventDate,
        registrationId: participant._id.toString(),
        registrationType: 'individual',
      });
    }
  } catch (emailError) {
    console.error('Failed to send registration notification:', emailError);
    // Don't fail registration if email fails
  }
  
  return participant;
};

/**
 * Get all participants with pagination and filtering
 */
export const getAllParticipants = async (options?: {
  skip?: number;
  limit?: number;
  dateFilter?: any;
}): Promise<{ participants: IParticipant[]; totalCount: number }> => {
  const skip = options?.skip || 0;
  const limit = options?.limit || 0;
  const dateFilter = options?.dateFilter || {};

  // Build the query filter
  const filter = Object.keys(dateFilter).length > 0 ? dateFilter : {};

  // Get total count for pagination
  const totalCount = await Participant.countDocuments(filter);

  // Build query
  let query = Participant.find(filter)
    .populate('eventId')
    .sort({ createdAt: -1 });

  // Apply pagination only if limit is provided
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const participants = await query;
  return { participants, totalCount };
};

/**
 * Get participants by event ID
 */
export const getParticipantsByEventId = async (
  eventId: string
): Promise<IParticipant[]> => {
  const participants = await Participant.find({
    eventId: new mongoose.Types.ObjectId(eventId),
  })
    .populate('eventId')
    .sort({ createdAt: -1 });
  return participants;
};

/**
 * Get participant by ID
 */
export const getParticipantById = async (
  id: string
): Promise<IParticipant | null> => {
  const participant = await Participant.findById(id).populate('eventId');
  return participant;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  id: string,
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'processed' | 'refunded'
): Promise<IParticipant | null> => {
  const participant = await Participant.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true, runValidators: true }
  ).populate('eventId');

  // Create invoice when payment status is changed to 'paid'
  if (paymentStatus === 'paid' && participant) {
    const invoice = await createInvoice({
      participantId: participant._id.toString(),
      eventId: participant.eventId._id?.toString() || participant.eventId.toString(),
      name: participant.full_name,
      email: participant.email,
      phone: participant.phone,
      attendeeType: participant.isStudent ? 'student' : 'professional',
      amount: participant.registraionFee,
      isGroup: participant.isGroup || false,
      groupSize: participant.isGroup ? participant.sizeOfGroup : undefined,
    });

    // Create transaction record for the payment
    try {
      const event = participant.eventId as any;
      await createTransaction({
        type: 'credit',
        description: 'Registration Payment',
        amount: participant.registraionFee,
        participantId: participant._id.toString(),
        participantName: participant.full_name,
        participantEmail: participant.email,
        eventId: event?._id?.toString(),
        eventName: event?.eventName,
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        status: 'completed',
      });
      console.log(`Transaction created for participant: ${participant.full_name}`);
    } catch (txnError) {
      console.error('Failed to create transaction:', txnError);
      // Don't fail payment update if transaction creation fails
    }

    // Send ONE combined email with registration confirmation, payment details, and invoice PDF
    try {
      const event = participant.eventId as any;
      if (event) {
        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const transactionDate = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Prepare invoice PDF data
        const invoicePDFData: InvoicePDFData = {
          invoiceNumber: invoice.invoiceNumber,
          invoiceId: invoice._id.toString(),
          participantName: participant.full_name,
          participantEmail: participant.email,
          participantPhone: participant.phone,
          eventName: event.eventName,
          eventDate,
          eventLocation: event.eventLocation,
          amount: participant.registraionFee,
          transactionId: participant._id.toString(),
          transactionDate,
          attendeeType: participant.isStudent ? 'student' : 'professional',
          isGroup: participant.isGroup || false,
          groupSize: participant.isGroup ? participant.sizeOfGroup : undefined,
        };

        // Get speaker info if available
        let speakerName = '';
        let speakerImage = '';
        let speakerTopic = '';
        if (event.speakerId) {
          const speaker = event.speakerId as any;
          if (speaker && typeof speaker === 'object') {
            speakerName = speaker.fullName || '';
            speakerImage = speaker.photo?.url || '';
            speakerTopic = speaker.topic || event.topic || '';
          }
        }

        // Send combined email to participant with invoice
        await sendPaymentConfirmationWithInvoice(
          participant.email,
          {
            name: participant.full_name,
            eventName: event.eventName,
            eventDate,
            eventTime: event.eventTime,
            eventLocation: event.eventLocation,
            registrationId: participant._id.toString(),
            amount: participant.registraionFee.toString(),
            invoiceNumber: invoice.invoiceNumber,
            transactionDate,
            speakerName,
            speakerImage,
            speakerTopic,
          },
          invoicePDFData
        );

        // For group registrations, send confirmation to all members
        if (participant.isGroup && participant.members) {
          for (const member of participant.members) {
            await sendPaymentConfirmationWithInvoice(
              member.email,
              {
                name: member.full_name,
                eventName: event.eventName,
                eventDate,
                eventTime: event.eventTime,
                eventLocation: event.eventLocation,
                registrationId: participant._id.toString(),
                amount: 'Included in group',
                invoiceNumber: invoice.invoiceNumber,
                transactionDate,
                speakerName,
                speakerImage,
                speakerTopic,
              }
              // No PDF for members - only leader gets invoice
            );
          }
        }
      }
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
      // Don't fail payment update if email fails
    }
  }

  return participant;
};

/**
 * Delete participant
 */
export const deleteParticipant = async (id: string): Promise<boolean> => {
  const participant = await Participant.findById(id);
  if (!participant) {
    return false;
  }
  // Decrement participant count on the event
  await Event.findByIdAndUpdate(participant.eventId, { $inc: { participantCount: -1 } });
  await participant.deleteOne();
  return true;
};

/**
 * Process refund for a participant
 */
export const processRefund = async (
  participantId: string,
  reason: string
): Promise<{ success: boolean; message: string; transaction?: any }> => {
  const participant = await Participant.findById(participantId).populate('eventId');
  
  if (!participant) {
    return { success: false, message: 'Participant not found' };
  }
  
  if (participant.paymentStatus !== 'paid') {
    return { success: false, message: 'Participant has not paid or already refunded' };
  }
  
  const event = participant.eventId as any;
  
  // Update participant payment status to refunded
  participant.paymentStatus = 'refunded';
  await participant.save();
  
  // Create debit transaction for the refund
  const transaction = await createTransaction({
    type: 'debit',
    description: `Refund - ${reason}`,
    amount: participant.registraionFee,
    participantId: participant._id.toString(),
    participantName: participant.full_name,
    participantEmail: participant.email,
    eventId: event?._id?.toString(),
    eventName: event?.eventName,
    status: 'completed',
    metadata: {
      refundReason: reason,
      originalPaymentDate: participant.createdAt,
    },
  });
  
  // Decrement participant count on the event
  await Event.findByIdAndUpdate(participant.eventId, { $inc: { participantCount: -1 } });
  
  // Send refund confirmation email
  try {
    const refundDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    await sendRefundConfirmationEmail(
      participant.email,
      {
        name: participant.full_name,
        eventName: event?.eventName || 'Event',
        amount: participant.registraionFee,
        reason,
        transactionId: transaction.transactionId,
        refundDate,
      }
    );
    console.log(`Refund confirmation email sent to: ${participant.email}`);
  } catch (emailError) {
    console.error('Failed to send refund confirmation email:', emailError);
    // Don't fail refund if email fails
  }
  
  return {
    success: true,
    message: 'Refund processed successfully',
    transaction,
  };
};

/**
 * Send payment link email to participant
 */
export const sendPaymentLinkEmail = async (
  participantId: string
): Promise<{ success: boolean; message: string }> => {
  const participant = await Participant.findById(participantId).populate('eventId');
  
  if (!participant) {
    return { success: false, message: 'Participant not found' };
  }
  
  if (participant.paymentStatus === 'paid') {
    return { success: false, message: 'Participant has already paid' };
  }
  
  const event = participant.eventId as any;
  
  // Import email service
  const { sendPaymentLinkEmail: sendEmail } = await import('./email.services');
  
  try {
    await sendEmail(
      participant.email,
      {
        name: participant.full_name,
        eventName: event?.eventName || 'Event',
        amount: participant.registraionFee,
        paymentLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment/${participant._id}`,
      }
    );
    
    return {
      success: true,
      message: 'Payment link sent successfully',
    };
  } catch (emailError) {
    console.error('Failed to send payment link email:', emailError);
    return {
      success: false,
      message: 'Failed to send payment link email',
    };
  }
};
