import { defineConfig, Plugin } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Folders that should be excluded from HTML entry scanning
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'src', '.git', '9i1h7htkfq16Njk5OGE3YTRlZmNkNjZkOWYyODU3ZTc5']);

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

export default defineConfig({
  plugins: [skipGtmDataFile],
  build: {
    rollupOptions: {
      input
    }
  }
});
