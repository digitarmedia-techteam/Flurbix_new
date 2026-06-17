/**
 * One-time script to obtain an OAuth2 refresh token for sales@flurbix.com.
 *
 * Run from flurbix-app/:
 *   npm run get-token
 *
 * Steps:
 *  1. Opens an authorization URL in the terminal
 *  2. Visit the URL in a browser logged in as sales@flurbix.com
 *  3. Paste the authorization code here
 *  4. Copy the printed refresh token → paste into .env as GOOGLE_REFRESH_TOKEN
 *
 * This script is NEVER deployed. It is a local dev tool only.
 */

import 'dotenv/config';
import { google } from 'googleapis';
import * as readline from 'readline';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI  || 'urn:ietf:wg:oauth:2.0:oob';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
  prompt: 'consent', // Forces consent to always return a refresh_token
});

console.log('\n=== Flurbix Google Calendar Authorization ===\n');
console.log('1. Open this URL in a browser logged in as sales@flurbix.com:\n');
console.log(authUrl);
console.log('\n2. After authorizing, paste the code from the page below.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the authorization code: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n✅ Success! Add these to your .env file:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (tokens.access_token) {
      console.log(`\n(Access token, not needed in .env):\n${tokens.access_token}`);
    }
    console.log('\n⚠️  Keep this refresh token secret. Never commit it to git.\n');
  } catch (error: any) {
    console.error('❌ Error exchanging code for tokens:', error.message);
    process.exit(1);
  }
});
