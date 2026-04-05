import { Enquiry } from '../models/Enquiry';
import { Participant } from '../models/Participants';
import { Event } from '../models/Events';
import { Transaction } from '../models/Transaction';

// Enquiries Report
export interface EnquiriesReportData {
  totalEnquiries: number;
  enquiriesByMonth: { month: string; count: number }[];
  recentEnquiries: {
    id: string;
    name: string;
    email: string;
    title: string;
    createdAt: string;
  }[];
}

export const getEnquiriesReport = async (): Promise<EnquiriesReportData> => {
  const totalEnquiries = await Enquiry.countDocuments();
  
  // Get enquiries grouped by month
  const enquiriesByMonth = await Enquiry.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const formattedEnquiriesByMonth = enquiriesByMonth.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    count: item.count
  })).reverse();

  const recentEnquiriesRaw = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email title createdAt');

  const recentEnquiries = recentEnquiriesRaw.map(e => ({
    id: e._id.toString(),
    name: e.name,
    email: e.email,
    title: e.title,
    createdAt: e.createdAt.toISOString()
  }));

  return {
    totalEnquiries,
    enquiriesByMonth: formattedEnquiriesByMonth,
    recentEnquiries
  };
};

// Student vs Professional Report
export interface AttendeeTypeReportData {
  totalParticipants: number;
  students: {
    count: number;
    individual: number;
    group: number;
    revenue: number;
  };
  professionals: {
    count: number;
    revenue: number;
  };
  breakdownByEvent: {
    eventId: string;
    eventName: string;
    students: number;
    professionals: number;
    total: number;
  }[];
}

export const getAttendeeTypeReport = async (): Promise<AttendeeTypeReportData> => {
  const participants = await Participant.find({
    paymentStatus: { $nin: ['refunded'] }
  }).populate('eventId', 'eventName');

  const students = participants.filter(p => p.isStudent);
  const professionals = participants.filter(p => !p.isStudent);

  const studentIndividuals = students.filter(s => !s.isGroup).length;
  const studentGroups = students.filter(s => s.isGroup).length;

  const studentRevenue = students.reduce((sum, s) => sum + (s.registraionFee || 0), 0);
  const professionalRevenue = professionals.reduce((sum, p) => sum + (p.registraionFee || 0), 0);

  // Group by event
  const eventMap = new Map();
  participants.forEach(p => {
    const eventId = (p.eventId as any)?._id?.toString() || p.eventId?.toString();
    const eventName = (p.eventId as any)?.eventName || 'Unknown Event';
    
    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, { eventId, eventName, students: 0, professionals: 0, total: 0 });
    }
    
    const event = eventMap.get(eventId);
    if (p.isStudent) {
      event.students++;
    } else {
      event.professionals++;
    }
    event.total++;
  });

  return {
    totalParticipants: participants.length,
    students: {
      count: students.length,
      individual: studentIndividuals,
      group: studentGroups,
      revenue: studentRevenue
    },
    professionals: {
      count: professionals.length,
      revenue: professionalRevenue
    },
    breakdownByEvent: Array.from(eventMap.values())
  };
};

// Group Registration Report
export interface GroupRegistrationReportData {
  totalGroups: number;
  totalGroupMembers: number;
  averageGroupSize: number;
  groups: {
    id: string;
    leadName: string;
    email: string;
    eventName: string;
    size: number;
    members: { name: string; email: string; phone: string }[];
    registrationFee: number;
    createdAt: string;
  }[];
}

export const getGroupRegistrationReport = async (): Promise<GroupRegistrationReportData> => {
  const groups = await Participant.find({
    isGroup: true,
    paymentStatus: { $nin: ['refunded'] }
  }).populate('eventId', 'eventName');

  const totalGroupMembers = groups.reduce((sum, g) => sum + (g.sizeOfGroup || 0), 0);

  const formattedGroups = groups.map(g => ({
    id: g._id.toString(),
    leadName: g.full_name,
    email: g.email,
    eventName: (g.eventId as any)?.eventName || 'Unknown Event',
    size: g.sizeOfGroup || 0,
    members: (g.members || []).map(m => ({
      name: m.full_name,
      email: m.email,
      phone: m.phone
    })),
    registrationFee: g.registraionFee || 0,
    createdAt: g.createdAt.toISOString()
  }));

  return {
    totalGroups: groups.length,
    totalGroupMembers,
    averageGroupSize: groups.length > 0 ? totalGroupMembers / groups.length : 0,
    groups: formattedGroups
  };
};

// Event-wise Registration Report
export interface EventRegistrationReportData {
  events: {
    eventId: string;
    eventName: string;
    eventDate: string;
    capacity: number;
    registered: number;
    seatsRemaining: number;
    revenue: number;
    students: number;
    professionals: number;
    groups: number;
  }[];
}

export const getEventRegistrationReport = async (): Promise<EventRegistrationReportData> => {
  const events = await Event.find().sort({ eventDate: 1 });
  
  const eventData = await Promise.all(events.map(async event => {
    const participants = await Participant.find({
      eventId: event._id,
      paymentStatus: { $nin: ['refunded'] }
    });

    const revenue = participants.reduce((sum, p) => sum + (p.registraionFee || 0), 0);
    const students = participants.filter(p => p.isStudent).length;
    const professionals = participants.filter(p => !p.isStudent).length;
    const groups = participants.filter(p => p.isGroup).length;

    return {
      eventId: event._id.toString(),
      eventName: event.eventName,
      eventDate: event.eventDate.toISOString(),
      capacity: event.capacity || 0,
      registered: participants.length,
      seatsRemaining: event.seatsRemaining || 0,
      revenue,
      students,
      professionals,
      groups
    };
  }));

  return { events: eventData };
};

// Revenue Report
export interface RevenueReportData {
  totalRevenue: number;
  totalTransactions: number;
  revenueByMonth: { month: string; revenue: number; transactions: number }[];
  revenueByEvent: { eventId: string; eventName: string; revenue: number; participants: number }[];
  refunds: {
    totalRefunded: number;
    count: number;
  };
}

export const getRevenueReport = async (): Promise<RevenueReportData> => {
  // Total revenue from credit transactions
  const creditTransactions = await Transaction.find({ type: 'credit' });
  const totalRevenue = creditTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Revenue by month
  const revenueByMonth = await Transaction.aggregate([
    { $match: { type: 'credit' } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const formattedRevenueByMonth = revenueByMonth.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    revenue: item.revenue,
    transactions: item.transactions
  })).reverse();

  // Revenue by event
  const participants = await Participant.find({
    paymentStatus: { $nin: ['refunded'] }
  }).populate('eventId', 'eventName');

  const eventRevenueMap = new Map();
  participants.forEach(p => {
    const eventId = (p.eventId as any)?._id?.toString() || p.eventId?.toString();
    const eventName = (p.eventId as any)?.eventName || 'Unknown Event';
    
    if (!eventRevenueMap.has(eventId)) {
      eventRevenueMap.set(eventId, { eventId, eventName, revenue: 0, participants: 0 });
    }
    
    const event = eventRevenueMap.get(eventId);
    event.revenue += p.registraionFee || 0;
    event.participants++;
  });

  // Refunds
  const refunds = await Transaction.find({ type: 'debit' });
  const totalRefunded = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

  return {
    totalRevenue,
    totalTransactions: creditTransactions.length,
    revenueByMonth: formattedRevenueByMonth,
    revenueByEvent: Array.from(eventRevenueMap.values()),
    refunds: {
      totalRefunded,
      count: refunds.length
    }
  };
};

// Transaction History
export interface TransactionHistoryData {
  transactions: {
    id: string;
    type: 'credit' | 'debit';
    description: string;
    amount: number;
    participantName: string;
    participantEmail: string;
    eventName: string;
    status: string;
    createdAt: string;
  }[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    netAmount: number;
  };
}

export const getTransactionHistory = async (): Promise<TransactionHistoryData> => {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .limit(100);

  const formattedTransactions = transactions.map(t => ({
    id: t._id.toString(),
    type: t.type,
    description: t.description,
    amount: t.amount,
    participantName: t.participantName || '',
    participantEmail: t.participantEmail || '',
    eventName: t.eventName || '',
    status: t.status,
    createdAt: t.createdAt.toISOString()
  }));

  const totalCredits = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalDebits = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return {
    transactions: formattedTransactions,
    summary: {
      totalCredits,
      totalDebits,
      netAmount: totalCredits - totalDebits
    }
  };
};
