import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`[Flurbix API] Server running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`[Flurbix API] Calendar: ${env.GOOGLE_CALENDAR_ID}`);
  if (env.NODE_ENV === 'production') {
    console.log('[Flurbix API] Serving static files from dist/');
  }
});
