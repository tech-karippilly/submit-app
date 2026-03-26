import { Payment, IPayment, AttendeeType } from '../models/Payments';

export interface CreatePaymentInput {
  attendeeType: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
  isActive?: boolean;
}

export interface UpdatePaymentInput {
  attendeeType?: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
  isActive?: boolean;
}

export const createPayment = async (input: CreatePaymentInput): Promise<IPayment> => {
  const payment = await Payment.create(input);
  return payment;
};

export const getAllPayments = async (): Promise<IPayment[]> => {
  const payments = await Payment.find({}).sort({ createdAt: -1 });
  return payments;
};

export const getPaymentById = async (id: string): Promise<IPayment | null> => {
  const payment = await Payment.findById(id);
  return payment;
};

export const getPaymentsByType = async (
  attendeeType: AttendeeType
): Promise<IPayment[]> => {
  const payments = await Payment.find({ attendeeType }).sort({ createdAt: -1 });
  return payments;
};

export const getPaymentsByAttendeeType = async (
  attendeeType: AttendeeType
): Promise<IPayment[]> => {
  const payments = await Payment.find({ attendeeType }).sort({ createdAt: -1 });
  return payments;
};

export const getActivePayments = async (): Promise<IPayment[]> => {
  const payments = await Payment.find({ isActive: true }).sort({ createdAt: -1 });
  return payments;
};

export const updatePayment = async (
  id: string,
  input: UpdatePaymentInput
): Promise<IPayment | null> => {
  const payment = await Payment.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return payment;
};

export const deletePayment = async (id: string): Promise<boolean> => {
  const payment = await Payment.findById(id);

  if (!payment) {
    return false;
  }

  await payment.deleteOne();
  return true;
};

export const togglePaymentStatus = async (id: string): Promise<IPayment | null> => {
  const payment = await Payment.findById(id);

  if (!payment) {
    return null;
  }

  payment.isActive = !payment.isActive;
  await payment.save();
  return payment;
};
