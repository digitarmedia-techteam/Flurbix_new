import { Router } from 'express';
import { getAvailableSlotsHandler, bookMeetingHandler } from '../controllers/calendarController';
import { validateAvailableSlots, validateBooking } from '../middleware/validate';
import { slotsRateLimiter, bookingRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/calendar/available-slots?date=YYYY-MM-DD
router.get('/available-slots', slotsRateLimiter, validateAvailableSlots, getAvailableSlotsHandler);

// POST /api/calendar/book
router.post('/book', bookingRateLimiter, validateBooking, bookMeetingHandler);

export default router;
