import { Contact, IContact } from '../models/Contact';

export interface CreateContactData {
  name: string;
  email: string;
  phone: string;
  addressOne: string;
  addressTwo?: string;
  city: string;
  state: string;
  pinCode: string;
  googleLocation?: string;
  about: string;
}

export const getContact = async (): Promise<IContact> => {
  let contact = await Contact.findOne();
  if (!contact) {
    // Create default contact if none exists
    contact = await Contact.create({
      name: 'The Summit LLP',
      email: 'info@thesummitllp.com',
      phone: '+91 XXX XXX XXXX',
      addressOne: 'The Summit LLP',
      addressTwo: '',
      city: 'Kochi',
      state: 'Kerala',
      pinCode: '000000',
      googleLocation: '',
      about: 'The Summit LLP - Healthcare Quality & Sustainability Conference',
    });
  }
  return contact;
};

export const updateContact = async (data: Partial<CreateContactData>): Promise<IContact | null> => {
  let contact = await Contact.findOne();
  
  if (!contact) {
    // Create new contact if none exists
    contact = await Contact.create({
      name: data.name || 'The Summit LLP',
      email: data.email || 'info@thesummitllp.com',
      phone: data.phone || '+91 XXX XXX XXXX',
      addressOne: data.addressOne || '',
      addressTwo: data.addressTwo || '',
      city: data.city || '',
      state: data.state || '',
      pinCode: data.pinCode || '',
      googleLocation: data.googleLocation || '',
      about: data.about || '',
    });
    return contact;
  }
  
  return await Contact.findByIdAndUpdate(
    contact._id,
    { $set: data },
    { new: true, runValidators: true }
  );
};
