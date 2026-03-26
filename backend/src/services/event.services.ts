import { Event, IEvent, IEventItinerary, IRegistrationFee, EventStatus } from '../models/Events';
import { Payment } from '../models/Payments';

export interface CreateEventInput {
  eventName: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  eventGoogleLink: string;
  eventDescription: string;
  topic?: string;
  eventTypeId?: string;
  status?: EventStatus;
  statusReason?: string;
  registrationFee?: IRegistrationFee;
  isCommonFee?: boolean;
  speakerId?: string;
  eventItinerary?: IEventItinerary[];
}

export interface UpdateEventInput {
  eventName?: string;
  eventDate?: Date;
  eventTime?: string;
  eventLocation?: string;
  eventGoogleLink?: string;
  eventDescription?: string;
  topic?: string;
  eventTypeId?: string;
  status?: EventStatus;
  statusReason?: string;
  registrationFee?: IRegistrationFee;
  isCommonFee?: boolean;
  speakerId?: string;
  eventItinerary?: IEventItinerary[];
}

export const createEvent = async (input: CreateEventInput): Promise<IEvent> => {
  let registrationFee = input.registrationFee;

  // If common fee is enabled, fetch from Payments collection
  if (input.isCommonFee) {
    const payments = await Payment.find({ isActive: true });
    
    // Find professional and student pricing
    const professionalPricing = payments.find(p => p.attendeeType === 'professional');
    const studentPricing = payments.find(p => p.attendeeType === 'student');

    if (!professionalPricing || !studentPricing) {
      throw new Error('Common pricing not found. Please configure pricing in the Payments section.');
    }

    registrationFee = {
      professional_individuals: professionalPricing.professional_individuals || 0,
      student_individuals: studentPricing.student_individuals || 0,
      student_group_per_head: studentPricing.student_group_per_head || 0,
    };
  }

  // Validate that registration fee is provided (either custom or from common fee)
  if (!registrationFee) {
    throw new Error('Registration fee is required. Either enable common fee or enter custom fees.');
  }

  // Validate all fee fields are present
  if (
    registrationFee.professional_individuals === undefined ||
    registrationFee.student_individuals === undefined ||
    registrationFee.student_group_per_head === undefined
  ) {
    throw new Error('All registration fee fields are required.');
  }

  const event = await Event.create({
    ...input,
    registrationFee,
  });
  return event;
};

export const getAllEvents = async (): Promise<IEvent[]> => {
  const events = await Event.find({}).populate('speakerId').sort({ eventDate: 1 });
  return events;
};

export const getEventById = async (id: string): Promise<IEvent | null> => {
  const event = await Event.findById(id).populate('speakerId');
  return event;
};

export const updateEvent = async (
  id: string,
  input: UpdateEventInput
): Promise<IEvent | null> => {
  let updateData = { ...input };

  // If common fee is enabled, fetch from Payments collection
  if (input.isCommonFee) {
    const payments = await Payment.find({ isActive: true });
    
    // Find professional and student pricing
    const professionalPricing = payments.find(p => p.attendeeType === 'professional');
    const studentPricing = payments.find(p => p.attendeeType === 'student');

    if (!professionalPricing || !studentPricing) {
      throw new Error('Common pricing not found. Please configure pricing in the Payments section.');
    }

    updateData.registrationFee = {
      professional_individuals: professionalPricing.professional_individuals || 0,
      student_individuals: studentPricing.student_individuals || 0,
      student_group_per_head: studentPricing.student_group_per_head || 0,
    };
  }

  const event = await Event.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('speakerId');
  return event;
};

export const updateEventStatus = async (
  id: string,
  status: EventStatus,
  reason?: string
): Promise<IEvent | null> => {
  const update: Partial<UpdateEventInput> = { status };
  if (status === 'cancelled' || status === 'delayed') {
    update.statusReason = reason;
  } else {
    update.statusReason = undefined;
  }

  const event = await Event.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate('speakerId');
  return event;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const event = await Event.findById(id);

  if (!event) {
    return false;
  }

  await event.deleteOne();
  return true;
};