import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Config] Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const env = {
  // Google Calendar OAuth2 — server-side only, never exposed to browser
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  GOOGLE_REFRESH_TOKEN: required('GOOGLE_REFRESH_TOKEN'),
  GOOGLE_CALENDAR_ID: optional('GOOGLE_CALENDAR_ID', 'sales@flurbix.com'),
  GOOGLE_REDIRECT_URI: optional('GOOGLE_REDIRECT_URI', 'urn:ietf:wg:oauth:2.0:oob'),

  // Email — server-side only, never exposed to browser
  ELASTIC_EMAIL_API_KEY: required('ELASTIC_EMAIL_API_KEY'),

  // Business hours (24-hour integers, configurable)
  CALENDAR_BUSINESS_START: parseInt(optional('CALENDAR_BUSINESS_START', '10')),
  CALENDAR_BUSINESS_END: parseInt(optional('CALENDAR_BUSINESS_END', '18')),
  CALENDAR_SLOT_DURATION_MINUTES: parseInt(optional('CALENDAR_SLOT_DURATION_MINUTES', '30')),

  // Server
  PORT: parseInt(optional('PORT', '5173')),
  NODE_ENV: optional('NODE_ENV', 'production'),
  ALLOWED_ORIGIN: optional('ALLOWED_ORIGIN', 'https://flurbix.com'),
} as const;
