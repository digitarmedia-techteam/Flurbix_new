import { env } from '../config/env';

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

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    handleGoogleApiError(new Error(errorText), 'getAccessToken');
  }
  
  const data = await response.json() as any;
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + ((data.expires_in - 60) * 1000);
  return cachedAccessToken!;
}

/**
 * Fetch all non-cancelled events for a given day on the company calendar.
 */
export async function getEventsForDay(dateStr: string): Promise<CalendarEvent[]> {
  const timeMin = new Date(`${dateStr}T00:00:00+05:30`).toISOString();
  const timeMax = new Date(`${dateStr}T23:59:59+05:30`).toISOString();

  if (isMockMode) {
    console.warn('[Google Calendar Service] Running in MOCK mode.');
    return [
      { id: 'mock-1', summary: 'Demo Booking Slot', start: { dateTime: `${dateStr}T11:00:00Z` }, end: { dateTime: `${dateStr}T11:30:00Z` }, status: 'confirmed' },
      { id: 'mock-2', summary: 'Lunch Break', start: { dateTime: `${dateStr}T13:00:00Z` }, end: { dateTime: `${dateStr}T14:00:00Z` }, status: 'confirmed' }
    ];
  }

  try {
    const token = await getAccessToken();
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events`);
    url.searchParams.append('timeMin', timeMin);
    url.searchParams.append('timeMax', timeMax);
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(await response.text());
    
    const data = await response.json() as any;
    const items = data.items || [];

    return items
      .filter((e: any) => e.status !== 'cancelled')
      .map((e: any) => ({
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
 */
export async function createBooking(params: BookingParams): Promise<CalendarEvent> {
  const { startDateTime, endDateTime, customerName, customerEmail, company, phone, website, linkedin, challenge, details, timezone } = params;

  if (isMockMode) {
    console.warn('[Google Calendar Service] Running in MOCK mode.');
    return {
      id: `mock-${Date.now()}`,
      summary: `Flurbix Demo — ${company}`,
      start: { dateTime: startDateTime.toISOString() },
      end:   { dateTime: endDateTime.toISOString() },
      status: 'confirmed',
      hangoutLink: 'https://meet.google.com/mock'
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
    const token = await getAccessToken();
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID)}/events`);
    url.searchParams.append('conferenceDataVersion', '1');
    url.searchParams.append('sendUpdates', 'all');

    const requestBody = {
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
    };

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(await response.text());
    
    const created = await response.json() as any;
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
  const isInvalidGrant = error.message?.includes('invalid_grant');

  if (isInvalidGrant) {
    console.error(
      `❌ [Google Calendar Service] OAuth error during ${actionName}: invalid_grant.\n` +
      `   Your GOOGLE_REFRESH_TOKEN in .env is invalid, revoked, or expired.\n` +
      `   👉 FIX: Run 'npm run get-token' locally to re-authenticate sales@flurbix.com and obtain a new refresh token.\n`
    );
  } else {
    console.error(`[Google Calendar Service] Error during ${actionName}:`, error.message || error);
  }
  throw error;
}
