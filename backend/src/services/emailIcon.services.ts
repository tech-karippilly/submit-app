import { EmailIcon, IEmailIcon, EmailIconCategory } from '../models/EmailIcon';

export interface CreateEmailIconInput {
  name: string;
  url: string;
  publicId?: string;
  category?: EmailIconCategory;
  width?: number;
  height?: number;
}

export interface UpdateEmailIconInput {
  name?: string;
  url?: string;
  publicId?: string;
  category?: EmailIconCategory;
  width?: number;
  height?: number;
  isActive?: boolean;
}

// Create email icon
export const createEmailIcon = async (
  input: CreateEmailIconInput
): Promise<IEmailIcon> => {
  const icon = await EmailIcon.create(input);
  return icon;
};

// Get all email icons
export const getAllEmailIcons = async (
  category?: EmailIconCategory
): Promise<IEmailIcon[]> => {
  const query: Record<string, unknown> = { isActive: true };
  if (category) {
    query.category = category;
  }
  const icons = await EmailIcon.find(query).sort({ createdAt: -1 });
  return icons;
};

// Get email icon by ID
export const getEmailIconById = async (id: string): Promise<IEmailIcon | null> => {
  const icon = await EmailIcon.findById(id);
  return icon;
};

// Update email icon
export const updateEmailIcon = async (
  id: string,
  input: UpdateEmailIconInput
): Promise<IEmailIcon | null> => {
  const icon = await EmailIcon.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return icon;
};

// Delete email icon
export const deleteEmailIcon = async (id: string): Promise<boolean> => {
  const icon = await EmailIcon.findById(id);
  if (!icon) {
    return false;
  }
  await icon.deleteOne();
  return true;
};
