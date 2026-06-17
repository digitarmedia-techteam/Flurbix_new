import type { Request, Response } from 'express';
import { getAvailableSlots, isSlotAvailable } from '../services/availabilityService';
import { createBooking } from '../services/googleCalendarService';
import { sendSalesNotificationEmail, sendCustomerConfirmationEmail } from '../services/emailService';
import type { BookingEmailData } from '../services/emailService';

/** GET /api/calendar/available-slots?date=YYYY-MM-DD */
export async function getAvailableSlotsHandler(req: Request, res: Response): Promise<void> {
  const { date } = req.query as { date: string };

  try {
    const available = await getAvailableSlots(date);
    res.json({ date, available });
  } catch (error: any) {
    console.error('[getAvailableSlots] Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch available slots. Please try again.' });
  }
}

/** POST /api/calendar/book */
export async function bookMeetingHandler(req: Request, res: Response): Promise<void> {
  const {
    date, time, timezone,
    firstName, lastName, email,
    company, phone, website, linkedin,
    challenge, details, origin,
  } = req.body;

  // --- Double-booking protection: re-check availability right before booking ---
  let slotStillAvailable: boolean;
  try {
    slotStillAvailable = await isSlotAvailable(date, time);
  } catch (error: any) {
    console.error('[bookMeeting] Availability check error:', error.message);
    res.status(503).json({ message: 'Could not verify slot availability. Please try again.' });
    return;
  }

  if (!slotStillAvailable) {
    res.status(409).json({ message: 'This slot has just been booked. Please choose another time.' });
    return;
  }

  // --- Parse slot time into Date objects ---
  const [timePart, period] = time.split(' ');
  const [h, m] = timePart.split(':').map(Number);
  let hour = h;
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const [year, month, day] = date.split('-').map(Number);
  const startDateTime = new Date(year, month - 1, day, hour, m);
  const endDateTime   = new Date(startDateTime.getTime() + 30 * 60 * 1000);

  // --- Create Google Calendar event ---
  let hangoutLink = '';
  try {
    const event = await createBooking({
      startDateTime, endDateTime,
      customerName:  `${firstName} ${lastName}`,
      customerEmail: email,
      company, phone,
      website:  website  || '',
      linkedin: linkedin || '',
      challenge,
      details:  details  || '',
      timezone: timezone || 'UTC',
    });
    hangoutLink = event.hangoutLink || '';
  } catch (error: any) {
    console.error('[bookMeeting] Calendar creation error:', error.message);
    res.status(503).json({ message: 'Failed to schedule the calendar event. Please try again.' });
    return;
  }

  // --- Build calendar links and readable strings ---
  const formatICS = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const readableDate       = startDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const fullMeetingDetails = `${readableDate} at ${time} (30 mins)`;
  const loc                = hangoutLink ? encodeURIComponent(hangoutLink) : 'Online+Meeting';

  const googleCalUrl  = `https://calendar.google.com/render?action=TEMPLATE&text=Flurbix+Demo+Meeting&dates=${formatICS(startDateTime)}/${formatICS(endDateTime)}&details=Demo+session+with+Flurbix.+Thank+you+for+booking!&location=${loc}&sf=true&output=xml`;
  const outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Flurbix+Demo+Meeting&startdt=${startDateTime.toISOString()}&enddt=${endDateTime.toISOString()}&body=Demo+session+with+Flurbix.+Thank+you+for+booking!${hangoutLink ? '+Join+Meet:+' + encodeURIComponent(hangoutLink) : ''}&location=${loc}`;

  const siteOrigin = (typeof origin === 'string' && origin.startsWith('http'))
    ? origin
    : 'https://flurbix.com';

  const emailData: BookingEmailData = {
    firstName, lastName, email,
    company, phone,
    website:  website  || '',
    linkedin: linkedin || '',
    challenge,
    details:  details  || '',
    fullMeetingDetails,
    hangoutMeetUrl: hangoutLink,
    googleCalUrl,
    outlookCalUrl,
    readableDate,
    meetingTimeStr: time,
    origin: siteOrigin,
  };

  // --- Send emails (non-blocking: a failed email must not fail the booking) ---
  Promise.all([
    sendSalesNotificationEmail(emailData)
      .catch(e => console.error('[bookMeeting] Sales email error:', e.message)),
    sendCustomerConfirmationEmail(emailData)
      .catch(e => console.error('[bookMeeting] Customer email error:', e.message)),
  ]);

  res.status(201).json({
    message:            'Meeting booked successfully.',
    hangoutLink,
    googleCalUrl,
    outlookCalUrl,
    fullMeetingDetails,
    readableDate,
    meetingTimeStr:     time,
  });
}
