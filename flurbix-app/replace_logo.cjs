const fs = require('fs');
const path = require('path');

const dir = 'e:\\web\\flurbix\\flurbix-app';
const targetURL = 'https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/6998b6d67ada951ad468174f_logo.svg';
const newURL = '/flurbix-logo.svg';

function replaceInDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filepath = path.join(currentDir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'src') continue;
            replaceInDir(filepath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filepath, 'utf8');
            if (content.includes(targetURL)) {
                content = content.split(targetURL).join(newURL);
                fs.writeFileSync(filepath, content);
                console.log(`Replaced logo in ${filepath}`);
            }
        }
    }
}

replaceInDir(dir);
console.log('Done replacing logo.');
