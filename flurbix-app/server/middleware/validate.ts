import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'aol.com', 'icloud.com', 'mail.com', 'zoho.com', 'protonmail.com',
  'proton.me', 'yandex.com', 'gmx.com', 'mail.ru', 'msn.com',
]);

const availableSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
});

const bookingSchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD.'),
  time:      z.string().min(1, 'Time slot is required.'),
  timezone:  z.string().optional().default('Asia/Kolkata'),
  firstName: z.string().min(2, 'First name must be at least 2 characters.').max(100),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters.').max(100),
  email: z.string()
    .email('Invalid email address.')
    .refine(val => !FREE_EMAIL_DOMAINS.has(val.split('@')[1]?.toLowerCase()), {
      message: 'Please use a work email address.',
    }),
  company:  z.string().min(1, 'Company name is required.').max(200),
  phone:    z.string().min(7, 'Phone number is too short.').max(20),
  website:  z.string().optional().default(''),
  linkedin: z.string().optional().default(''),
  challenge: z.string().min(1, 'Challenge selection is required.'),
  details:  z.string().max(500).optional().default(''),
  origin:   z.string().optional().default('https://flurbix.com'),
});

function validate(schema: z.ZodSchema, source: 'body' | 'query') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) {
      res.status(422).json({
        message: 'Validation failed.',
        errors: result.error.errors.map(e => ({
          field:   e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    // Attach parsed+coerced data back so downstream always has clean values
    if (source === 'body') req.body = result.data;
    else (req as any).query = result.data;
    next();
  };
}

export const validateAvailableSlots = validate(availableSlotsSchema, 'query');
export const validateBooking        = validate(bookingSchema, 'body');
