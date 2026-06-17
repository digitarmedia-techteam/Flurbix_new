import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env';
import calendarRoutes from './routes/calendarRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// --- CORS ---
// In production, Nginx proxies /api/ so the request origin is the same domain — no CORS needed.
// In development, Vite proxy forwards /api/ to :5173, also same-origin.
// We still configure CORS as a safety net for direct API access or future sub-domain setups.
const allowedOrigins = [
  env.ALLOWED_ORIGIN,
  'http://localhost:5174', // Vite dev server
  'http://localhost:5173', // Express server
  'https://schilling-smoked-twitch.ngrok-free.dev',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Nginx proxy, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '50kb' }));

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Calendar API routes ---
app.use('/api/calendar', calendarRoutes);

// --- Serve Vite static build in production ---
// In development Vite handles its own static serving on :5173.
if (env.NODE_ENV === 'production') {
  // dist/ is one level up from server/ at runtime
  const staticPath = path.join(__dirname, '..', 'dist');

  // Redirect /index.html to / and clean other .html URLs
  app.use((req, res, next) => {
    if (req.path === '/index.html') {
      const query = req.url.substring(req.path.length);
      return res.redirect(301, '/' + query);
    }
    if (req.path.endsWith('.html')) {
      const cleanPath = req.path.slice(0, -5);
      const query = req.url.substring(req.path.length);
      return res.redirect(301, cleanPath + query);
    }
    next();
  });

  app.use(express.static(staticPath));

  // Multi-page fallback: serve specific HTML files by directory
  app.get('*', (req, res, next) => {
    // Don't intercept API routes
    if (req.path.startsWith('/api')) return next();

    // Try clean URLs (if request is /demo, look for dist/demo.html)
    const relativePath = req.path === '/' ? '/index' : req.path;
    const filePath = path.join(staticPath, relativePath + '.html');

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // Fall back to index.html for unknown paths
    res.sendFile(path.join(staticPath, 'index.html'), err => {
      if (err) res.status(404).send('Page not found.');
    });
  });
}

// --- 404 handler (API paths only in dev) ---
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// --- Global error handler ---
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ message: 'Internal server error.' });
});

export default app;
