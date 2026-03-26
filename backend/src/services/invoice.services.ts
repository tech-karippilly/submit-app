import { Invoice, IInvoice, InvoiceStatus } from '../models/Invoice';
import { Participant } from '../models/Participants';

// Generate unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    invoiceNumber: { $regex: `^INV-${year}` },
  });
  const sequence = (count + 1).toString().padStart(3, '0');
  return `INV-${year}-${sequence}`;
};

export interface CreateInvoiceData {
  participantId: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  attendeeType: 'professional' | 'student';
  amount: number;
  isGroup: boolean;
  groupSize?: number;
}

export const createInvoice = async (data: CreateInvoiceData): Promise<IInvoice> => {
  const invoiceNumber = await generateInvoiceNumber();
  
  // Set due date to 10 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 10);

  const invoice = await Invoice.create({
    invoiceNumber,
    participantId: data.participantId,
    eventId: data.eventId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    attendeeType: data.attendeeType,
    amount: data.amount,
    status: 'pending',
    isGroup: data.isGroup,
    groupSize: data.groupSize,
    dueDate,
  });

  return invoice;
};

export const getAllInvoices = async (status?: InvoiceStatus): Promise<IInvoice[]> => {
  const filter: Record<string, unknown> = {};
  if (status) {
    filter.status = status;
  }
  
  const invoices = await Invoice.find(filter)
    .populate('eventId', 'eventName')
    .populate('participantId')
    .sort({ createdAt: -1 });
  
  return invoices;
};

export const getInvoiceById = async (id: string): Promise<IInvoice | null> => {
  const invoice = await Invoice.findById(id)
    .populate('eventId')
    .populate('participantId');
  return invoice;
};

export const getInvoiceByParticipantId = async (participantId: string): Promise<IInvoice | null> => {
  const invoice = await Invoice.findOne({ participantId })
    .populate('eventId')
    .populate('participantId');
  return invoice;
};

export const updateInvoiceStatus = async (
  id: string,
  status: InvoiceStatus
): Promise<IInvoice | null> => {
  const updateData: Record<string, unknown> = { status };
  
  if (status === 'paid') {
    updateData.paidAt = new Date();
  }
  
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('eventId')
    .populate('participantId');
  
  // Also update participant payment status
  if (invoice && invoice.participantId) {
    const participantStatus = status === 'paid' ? 'paid' : status === 'refunded' ? 'refunded' : 'pending';
    await Participant.findByIdAndUpdate(
      invoice.participantId,
      { paymentStatus: participantStatus }
    );
  }
  
  return invoice;
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  const invoice = await Invoice.findByIdAndDelete(id);
  return !!invoice;
};

export const getInvoiceStats = async () => {
  const invoices = await Invoice.find({});
  
  const paid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const refunded = invoices.filter(i => i.status === 'refunded').reduce((sum, i) => sum + i.amount, 0);
  
  return {
    paid,
    pending,
    refunded,
    total: invoices.length,
  };
};
