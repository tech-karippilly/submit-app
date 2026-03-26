import mongoose from 'mongoose';
import { Participant, IParticipant, IMember } from '../models/Participants';
import { Event } from '../models/Events';
import { createInvoice } from './invoice.services';
import {
  sendRegistrationNotificationToAdmin,
  sendPaymentConfirmationWithInvoice,
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
 * Register a student as an individual
 */
export const registerStudentIndividual = async (
  input: RegisterStudentIndividualInput
): Promise<IParticipant> => {
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
