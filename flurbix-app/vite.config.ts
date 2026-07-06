import { defineConfig, Plugin } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sync logo to public assets folder before build/dev starts
try {
  const srcLogo = resolve(__dirname, 'src/assets/logo.png');
  if (fs.existsSync(srcLogo)) {
    const destDir = resolve(__dirname, 'public/src/assets');
    const destLogo = resolve(destDir, 'logo.png');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcLogo, destLogo);
    console.log('[Vite Config] Logo sync to public folder completed successfully.');
  }
} catch (err) {
  console.error('[Vite Config] Failed to sync logo assets:', err);
}

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
        // Intercept GTM data requests and return dummy JavaScript to avoid console errors
        if (req.url.includes('9i1h7htkfq16Njk5OGE3YTRlZmNkNjZkOWYyODU3ZTc5')) {
          res.setHeader('Content-Type', 'application/javascript');
          res.end('/* gtm data - skipped by vite */');
          return;
        }

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

// Plugin: resolve include tags (e.g. <include src="/footer.html"></include>) in HTML files
const htmlIncludePlugin: Plugin = {
  name: 'html-include',
  transformIndexHtml(html) {
    const includeRegex = /<include\s+src="([^"]+)"\s*><\/include>/g;
    return html.replace(includeRegex, (match, src) => {
      const filePath = resolve(__dirname, src.startsWith('/') ? src.substring(1) : src);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      console.warn(`[html-include] File not found: ${filePath}`);
      return match;
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
  plugins: [skipGtmDataFile, cleanUrlsPlugin, htmlIncludePlugin],
  build: {
    rollupOptions: {
      input
    }
  }
});
