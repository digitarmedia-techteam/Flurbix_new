import type { Request, Response } from 'express';
import { sendContactInquiryEmail, sendContactConfirmationEmail } from '../services/emailService';
import type { ContactEmailData } from '../services/emailService';

/** POST /api/contact */
export async function contactSubmitHandler(req: Request, res: Response): Promise<void> {
  const { fullName, email, company, category, subject, message } = req.body;

  const emailData: ContactEmailData = {
    fullName,
    email,
    company,
    category,
    subject,
    message,
    origin: req.headers.origin || 'https://flurbix.com',
  };

  try {
    // Run both emails in parallel (non-blocking errors)
    await Promise.all([
      sendContactInquiryEmail(emailData)
        .catch(e => console.error('[contactSubmit] Inquiry email error:', e.message)),
      sendContactConfirmationEmail(emailData)
        .catch(e => console.error('[contactSubmit] Confirmation email error:', e.message)),
    ]);

    res.json({
      success: true,
      message: 'Your inquiry has been submitted and confirmed successfully.',
    });
  } catch (error: any) {
    console.error('[contactSubmit] Server error:', error.message);
    res.status(500).json({ message: 'Internal server error processing contact submission.' });
  }
}
