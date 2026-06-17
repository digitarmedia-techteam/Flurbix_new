import { defineConfig, Plugin } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Folders that should be excluded from HTML entry scanning
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'src', '.git', 'server', 'scripts', '9i1h7htkfq16Njk5OGE3YTRlZmNkNjZkOWYyODU3ZTc5']);


function getHtmlEntries(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(resolve(dir, file));
    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.has(file)) {
        getHtmlEntries(resolve(dir, file), fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(resolve(dir, file));
    }
  }
  return fileList;
}

const entries = getHtmlEntries(__dirname);
const input = Object.fromEntries(
  entries.map(file => {
    const relativePath = file.substring(__dirname.length + 1).replace(/\\/g, '/');
    return [relativePath.replace(/\.html$/, ''), file];
  })
);

// Plugin: return empty JS for the GTM data file so Vite's import-analysis
// doesn't fail trying to parse it as JavaScript.
const skipGtmDataFile: Plugin = {
  name: 'skip-gtm-data-file',
  load(id) {
    if (id.includes('9i1h7htkfq16Njk5OGE3YTRlZmNkNjZkOWYyODU3ZTc5')) {
      return { code: '/* gtm data – skipped by vite */', map: null };
    }
  },
};

// Plugin: rewrite clean URLs (e.g. /demo -> /demo.html) in dev server
const cleanUrlsPlugin: Plugin = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url) {
        try {
          const url = new URL(req.url, 'http://localhost');
          const pathname = url.pathname;

          // Skip API, assets, or files with extensions
          if (!pathname.startsWith('/api') && !pathname.includes('.') && pathname !== '/') {
            // Check if the corresponding HTML file exists in the directory
            const htmlPath = resolve(__dirname, pathname.substring(1) + '.html');
            if (fs.existsSync(htmlPath)) {
              req.url = pathname + '.html' + url.search;
            }
          }
        } catch (e) {
          console.error('[Clean URLs Plugin Error]', e);
        }
      }
      next();
    });
  },
};

export default defineConfig({
  server: {
    port: 5174,
    allowedHosts: ["schilling-smoked-twitch.ngrok-free.dev"],
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
    },
  },
  plugins: [skipGtmDataFile, cleanUrlsPlugin],
  build: {
    rollupOptions: {
      input
    }
  }
});
