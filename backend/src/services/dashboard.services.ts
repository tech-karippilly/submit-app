import { Enquiry } from '../models/Enquiry';
import { Speaker } from '../models/Speaker';
import { Event } from '../models/Events';
import { Participant } from '../models/Participants';
import Hero from '../models/Hero';
import { Transaction } from '../models/Transaction';

export interface DashboardStats {
  enquiriesCount: number;
  speakersCount: number;
  eventsCount: number;
  participantsCount: number;
  carouselImagesCount: number;
  totalRevenue: number;
}

export interface RecentEnquiry {
  id: string;
  title: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentEnquiries: RecentEnquiry[];
}

export const getDashboardStats = async (): Promise<DashboardData> => {
  const enquiriesCount = await Enquiry.countDocuments();
  const speakersCount = await Speaker.countDocuments();
  const eventsCount = await Event.countDocuments();
  // Count only active participants (not refunded)
  const participantsCount = await Participant.countDocuments({
    paymentStatus: { $nin: ['refunded'] }
  });

  const hero = await Hero.findOne();
  const carouselImagesCount = hero?.carousel?.length || 0;

  // Calculate total revenue from credit transactions
  const revenueResult = await Transaction.aggregate([
    { $match: { type: 'credit' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  const recentEnquiriesRaw = await Enquiry.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title name email createdAt');

  const recentEnquiries: RecentEnquiry[] = recentEnquiriesRaw.map((enquiry) => ({
    id: enquiry._id.toString(),
    title: enquiry.title,
    name: enquiry.name,
    email: enquiry.email,
    createdAt: enquiry.createdAt.toISOString()
  }));

  return {
    stats: {
      enquiriesCount,
      speakersCount,
      eventsCount,
      participantsCount,
      carouselImagesCount,
      totalRevenue
    },
    recentEnquiries
  };
};
