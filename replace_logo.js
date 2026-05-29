const fs = require('fs');
const path = require('path');

const directory = 'e:\\web\\flurbix';

function processContent(content) {
    // We need to replace the <img> tag that contains '69b058886ab4de26535d283c_horizontal.svg'
    // It might span multiple lines because of Prettier formatting
    const regex = /<img[^>]*69b058886ab4de26535d283c_horizontal\.svg[^>]*>/g;
    const replacement = `<span class="navbar1_logo is-2" style="font-size: 26px; font-weight: 500; color: #111827; margin-left: 6px; letter-spacing: -0.02em;">flurbix</span>`;
    return content.replace(regex, replacement);
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
            if (file.endsWith('.html')) {
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
