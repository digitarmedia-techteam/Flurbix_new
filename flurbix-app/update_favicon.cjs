const fs = require('fs');
const path = require('path');

const rootDir = 'e:\\web\\flurbix\\flurbix-app';
const srcFavicon = path.join(rootDir, 'src', 'assets', 'favicon.png');
const publicFavicon = path.join(rootDir, 'public', 'favicon.png');

if (!fs.existsSync(path.join(rootDir, 'public'))) {
    fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
}
if (fs.existsSync(srcFavicon)) {
    fs.copyFileSync(srcFavicon, publicFavicon);
    console.log(`Copied ${srcFavicon} to ${publicFavicon}`);
} else {
    console.warn(`Source favicon not found at ${srcFavicon}`);
}

function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (['node_modules', 'dist', '.git', 'src'].includes(file)) continue;
            processHtmlFiles(filepath);
        } else if (file.endsWith('.html')) {
            let originalContent = fs.readFileSync(filepath, 'utf8');
            let content = originalContent;

            content = content.replace(/<link\s+[^>]*rel="shortcut icon"[^>]*>/gi, '<link href="/favicon.png" rel="icon" type="image/png" />\n  <link href="/favicon.png" rel="shortcut icon" type="image/x-icon" />');
            
            content = content.replace(/<link\s+[^>]*rel="apple-touch-icon"[^>]*>/gi, '<link href="/favicon.png" rel="apple-touch-icon" />');

            if (content !== originalContent) {
                fs.writeFileSync(filepath, content);
                console.log(`Updated favicon in ${filepath}`);
            }
        }
    }
}

processHtmlFiles(rootDir);
console.log('Favicon update complete.');
