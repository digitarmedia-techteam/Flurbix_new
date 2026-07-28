import { google } from 'googleapis';
import { env } from '../config/env';

// Authenticated as sales@flurbix.com via stored refresh token.
// The customer NEVER authenticates — all auth is server-side.
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Run in mock mode if Google OAuth credentials are not fully configured
const isMockMode =
  !env.GOOGLE_CLIENT_SECRET ||
  !env.GOOGLE_REFRESH_TOKEN ||
  env.GOOGLE_CLIENT_SECRET.includes('<') ||
  env.GOOGLE_REFRESH_TOKEN.includes('<');

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  status: string;
  hangoutLink?: string;
}

export interface BookingParams {
  startDateTime: Date;
  endDateTime: Date;
  customerName: string;
  customerEmail: string;
  company: string;
  phone: string;
  website: string;
  linkedin: string;
  challenge: string;
  details: string;
  timezone: string;
}

/**
 * Fetch all non-cancelled events for a given day on the company calendar.
 * Used to compute which slots are occupied.
 */
export async function getEventsForDay(dateStr: string): Promise<CalendarEvent[]> {
  const timeMin = new Date(`${dateStr}T00:00:00+05:30`).toISOString();
  const timeMax = new Date(`${dateStr}T23:59:59+05:30`).toISOString();

  if (isMockMode) {
    console.warn('[Google Calendar Service] Running in MOCK mode. Returning simulated events.');
    // Simulated occupied slots for testing UI
    return [
      {
        id: 'mock-event-1',
        summary: 'Demo Booking Slot (Simulated Occupied)',
        start: { dateTime: `${dateStr}T11:00:00Z` },
        end:   { dateTime: `${dateStr}T11:30:00Z` },
        status: 'confirmed'
      },
      {
        id: 'mock-event-2',
        summary: 'Lunch Break (Simulated Occupied)',
        start: { dateTime: `${dateStr}T13:00:00Z` },
        end:   { dateTime: `${dateStr}T14:00:00Z` },
        status: 'confirmed'
      }
    ];
  }

  try {
    const response = await calendar.events.list({
      calendarId: env.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = response.data.items || [];

    // Exclude cancelled events — cancelled slots become available again
    return items
      .filter(e => e.status !== 'cancelled')
      .map(e => ({
        id: e.id || '',
        summary: e.summary || '',
        start: { dateTime: e.start?.dateTime || e.start?.date || '' },
        end:   { dateTime: e.end?.dateTime   || e.end?.date   || '' },
        status: e.status || 'confirmed',
        hangoutLink: e.hangoutLink || undefined,
      }));
  } catch (error: any) {
    handleGoogleApiError(error, 'getEventsForDay');
  }
}

/**
 * Create a booking on the company calendar.
 * `sendUpdates: 'all'` makes Google automatically email an invitation to the customer.
 * Returns the created event including Google Meet hangoutLink.
 */
export async function createBooking(params: BookingParams): Promise<CalendarEvent> {
  const {
    startDateTime, endDateTime,
    customerName, customerEmail,
    company, phone, website, linkedin, challenge, details,
    timezone,
  } = params;

  if (isMockMode) {
    console.warn('[Google Calendar Service] Running in MOCK mode. Simulating booking creation.');
    return {
      id: `mock-booking-${Date.now()}`,
      summary: `Flurbix Demo — ${company} (Simulated)`,
      start: { dateTime: startDateTime.toISOString() },
      end:   { dateTime: endDateTime.toISOString() },
      status: 'confirmed',
      hangoutLink: 'https://meet.google.com/abc-defg-hij'
    };
  }

  const description = [
    'Demo session with Flurbix.',
    '',
    'Contact Details:',
    `- Name: ${customerName}`,
    `- Company: ${company}`,
    `- Email: ${customerEmail}`,
    `- Phone: ${phone}`,
    `- Website: ${website || 'N/A'}`,
    `- LinkedIn: ${linkedin || 'N/A'}`,
    `- Challenge: ${challenge}`,
    `- Details: ${details || 'N/A'}`,
  ].join('\n');

  try {
    const response = await calendar.events.insert({
      calendarId: env.GOOGLE_CALENDAR_ID,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Google auto-sends invitation email to attendees
      requestBody: {
        summary: `Flurbix Demo — ${company}`,
        description,
        start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
        end:   { dateTime: endDateTime.toISOString(),   timeZone: timezone },
        attendees: [
          { email: env.GOOGLE_CALENDAR_ID, responseStatus: 'accepted'    },
          { email: customerEmail,          responseStatus: 'needsAction' },
        ],
        conferenceData: {
          createRequest: {
            requestId: `flurbix-demo-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      },
    });

    const created = response.data;
    return {
      id: created.id || '',
      summary: created.summary || '',
      start: { dateTime: created.start?.dateTime || '' },
      end:   { dateTime: created.end?.dateTime   || '' },
      status: created.status || 'confirmed',
      hangoutLink: created.hangoutLink || undefined,
    };
  } catch (error: any) {
    handleGoogleApiError(error, 'createBooking');
  }
}

function handleGoogleApiError(error: any, actionName: string): never {
  const isInvalidGrant =
    error.message?.includes('invalid_grant') ||
    error.response?.data?.error === 'invalid_grant';

  if (isInvalidGrant) {
    console.error(
      `❌ [Google Calendar Service] OAuth error during ${actionName}: invalid_grant.\n` +
      `   Your GOOGLE_REFRESH_TOKEN in .env is invalid, revoked, or expired.\n` +
      `   👉 FIX: Run 'npm run get-token' locally to re-authenticate sales@flurbix.com and obtain a new refresh token.\n` +
      `   👉 NOTE: If your GCP OAuth Consent Screen Publishing Status is 'Testing', refresh tokens automatically expire after 7 days! Set status to 'In Production' in GCP Console.`
    );
  } else {
    console.error(`[Google Calendar Service] Error during ${actionName}:`, error.message || error);
  }
  throw error;
}
