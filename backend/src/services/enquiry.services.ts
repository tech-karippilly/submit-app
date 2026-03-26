import { Enquiry, IEnquiry } from '../models/Enquiry';
import { sendEnquiryNotificationToAdmin } from './email.services';
import { Event } from '../models/Events';

export interface CreateEnquiryInput {
  eventId?: string;
  title: string;
  description: string;
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateEnquiryInput {
  eventId?: string;
  title?: string;
  description?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export const createEnquiry = async (input: CreateEnquiryInput): Promise<IEnquiry> => {
  const enquiryData: Record<string, unknown> = {
    title: input.title,
    description: input.description,
    name: input.name,
    email: input.email,
  };

  if (input.phone) {
    enquiryData.phone = input.phone;
  }

  if (input.eventId) {
    enquiryData.eventId = input.eventId;
  }

  const enquiry = await Enquiry.create(enquiryData);

  // Send email notification to info email
  try {
    let eventName: string | undefined;
    if (input.eventId) {
      const event = await Event.findById(input.eventId);
      eventName = event?.eventName;
    }

    await sendEnquiryNotificationToAdmin({
      name: input.name,
      email: input.email,
      phone: input.phone,
      title: input.title,
      description: input.description,
      eventName,
      enquiryId: enquiry._id.toString(),
    });
  } catch (emailError) {
    console.error('Failed to send enquiry notification:', emailError);
    // Don't fail enquiry creation if email fails
  }

  return enquiry;
};

export const getAllEnquiries = async (eventId?: string): Promise<IEnquiry[]> => {
  let query = {};
  if (eventId) {
    query = { eventId };
  }
  const enquiries = await Enquiry.find(query)
    .populate('eventId', 'title topic')
    .sort({ createdAt: -1 });
  return enquiries;
};

export const getEnquiryById = async (id: string): Promise<IEnquiry | null> => {
  const enquiry = await Enquiry.findById(id).populate('eventId', 'title topic');
  return enquiry;
};

export const updateEnquiry = async (
  id: string,
  input: UpdateEnquiryInput
): Promise<IEnquiry | null> => {
  const enquiry = await Enquiry.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).populate('eventId', 'title topic');
  return enquiry;
};

export const deleteEnquiry = async (id: string): Promise<boolean> => {
  const enquiry = await Enquiry.findById(id);

  if (!enquiry) {
    return false;
  }

  await enquiry.deleteOne();
  return true;
};
