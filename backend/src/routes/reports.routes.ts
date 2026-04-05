import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  enquiriesReport,
  attendeeTypeReport,
  groupRegistrationReport,
  eventRegistrationReport,
  revenueReport,
  transactionHistory,
} from '../controllers/reports.controller';

const router = Router();

// Enquiries Report
router.get(ROUTE.REPORTS.ENQUIRIES, enquiriesReport);

// Student vs Professional Report
router.get(ROUTE.REPORTS.ATTENDEE_TYPES, attendeeTypeReport);

// Group Registration Report
router.get(ROUTE.REPORTS.GROUP_REGISTRATIONS, groupRegistrationReport);

// Event-wise Registration Report
router.get(ROUTE.REPORTS.EVENT_REGISTRATIONS, eventRegistrationReport);

// Revenue Report
router.get(ROUTE.REPORTS.REVENUE, revenueReport);

// Transaction History
router.get(ROUTE.REPORTS.TRANSACTIONS, transactionHistory);

export default router;
