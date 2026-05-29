const fs = require('fs');
const path = require('path');

const dir = 'e:\\web\\flurbix\\flurbix-app';
const srcDir = path.join(dir, 'src', 'scripts');
fs.mkdirSync(srcDir, { recursive: true });

function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filepath = path.join(currentDir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'src') continue;
            walk(filepath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filepath, 'utf8');
            let tsContent = "declare const gsap: any;\ndeclare const SplitText: any;\ndeclare const Splide: any;\ndeclare const window: any;\ndeclare const document: any;\n\n";
            let hasScripts = false;
            
            content = content.replace(/<script>\s*([\s\S]*?)\s*<\/script>/g, (match, scriptContent) => {
                hasScripts = true;
                tsContent += scriptContent + "\n\n";
                return ''; // remove inline script
            });
            
            if (hasScripts) {
                const relPath = path.relative(dir, filepath);
                const safeName = relPath.replace(/[^a-zA-Z0-9]/g, '_') + '.ts';
                const tsPath = path.join(srcDir, safeName);
                fs.writeFileSync(tsPath, tsContent);
                
                // Also we need to inject the <script type="module" src="/src/scripts/safeName"></script>
                // Find </body> and replace it
                const scriptTag = `<script type="module" src="/src/scripts/${safeName}"></script>\n  </body>`;
                if (content.includes('</body>')) {
                    content = content.replace('</body>', scriptTag);
                } else {
                    content += '\n' + scriptTag;
                }
                
                fs.writeFileSync(filepath, content);
                console.log(`Extracted scripts from ${relPath} to src/scripts/${safeName}`);
            }
        }
    }
}

walk(dir);
console.log("Done extracting inline scripts.");
