import rateLimit from 'express-rate-limit';

/** 100 req / 15 min per IP for reading available slots */
export const slotsRateLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            100,
  message:        { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:  false,
  validate:       { xForwardedForHeader: false },
});

/** 5 booking attempts / hour per IP */
export const bookingRateLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            5,
  message:        { message: 'Too many booking attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders:  false,
  validate:       { xForwardedForHeader: false },
});
