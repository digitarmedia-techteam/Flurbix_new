const fs = require('fs');
const path = require('path');

const directory = 'e:\\web\\flurbix';

function processContent(content) {
    const cdnPattern = /https:\/\/[^"'\s)]*website-files\.com\/[^"'\s)<>]+/g;
    const placeholders = {};
    let idx = 0;
    
    // Step 1: Replace CDN URLs
    content = content.replace(cdnPattern, (match) => {
        const key = `__CDN_URL_${idx}__`;
        placeholders[key] = match;
        idx++;
        return key;
    });
    
    // Step 2: Replace brand names
    content = content.replace(/Auxia/g, 'Flurbix');
    content = content.replace(/AUXIA/g, 'FLURBIX');
    content = content.replace(/auxia/g, 'flurbix');
    
    // Step 3: Restore CDN URLs
    for (const [key, val] of Object.entries(placeholders)) {
        content = content.replace(key, val);
    }
    
    return content;
}

function walk(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            if (file === '.git' || file === '.gemini' || file === 'node_modules') continue;
            count += walk(filepath);
        } else {
            if (file.endsWith('.html') || file.endsWith('.txt')) {
                const content = fs.readFileSync(filepath, 'utf8');
                const newContent = processContent(content);
                if (newContent !== content) {
                    fs.writeFileSync(filepath, newContent, 'utf8');
                    console.log(`Updated: ${filepath}`);
                    count++;
                }
            }
        }
    }
    return count;
}

const count = walk(directory);
console.log(`Done. Updated ${count} files.`);
