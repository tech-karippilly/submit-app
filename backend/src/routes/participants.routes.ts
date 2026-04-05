import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  register,
  getAll,
  getByEventId,
  getById,
  updatePayment,
  remove,
  getPaidParticipantsByEvent,
  refundParticipant,
  sendPaymentLink,
} from '../controllers/participants.controller';

const router = Router();

// Register participant (single endpoint for all registration types)
router.post(ROUTE.PARTICIPANTS.REGISTER, register);

// Get all participants
router.get(ROUTE.PARTICIPANTS.GET_PARTICIPANTS, getAll);

// Get participants by event ID
router.get(ROUTE.PARTICIPANTS.GET_PARTICIPANTS_BY_EVENT_ID, getByEventId);

// Get paid participants by event ID (for refunds)
router.get('/event/:eventId/paid', getPaidParticipantsByEvent);

// Get participant by ID
router.get('/:id', getById);

// Update payment status
router.patch('/:id/payment', updatePayment);

// Process refund
router.post('/:id/refund', refundParticipant);

// Send payment link
router.post('/:id/send-payment-link', sendPaymentLink);

// Delete participant
router.delete('/:id', remove);

export default router;
