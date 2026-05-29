import os
import re

directory = r"e:\web\flurbix"

def process_content(content):
    # Step 1: Extract CDN URLs and replace with placeholders
    cdn_pattern = re.compile(r'https://[^"\'\s)]*website-files\.com/[^"\'\s)<>]+')
    placeholders = {}
    
    def repl_cdn(match):
        idx = len(placeholders)
        key = f"__CDN_URL_{idx}__"
        placeholders[key] = match.group(0)
        return key

    content = cdn_pattern.sub(repl_cdn, content)
    
    # Step 2: Replace brand names
    content = content.replace("Auxia", "Flurbix")
    content = content.replace("AUXIA", "FLURBIX")
    content = content.replace("auxia", "flurbix")
    
    # Step 3: Restore CDN URLs
    for key, val in placeholders.items():
        content = content.replace(key, val)
        
    return content

count = 0
for root, dirs, files in os.walk(directory):
    # skip .git or other hidden dirs if any
    if ".git" in root or ".gemini" in root:
        continue
    for file in files:
        if file.endswith(".html") or file.endswith(".txt"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                try:
                    content = f.read()
                except UnicodeDecodeError:
                    continue
            
            new_content = process_content(content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")
                count += 1

print(f"Done. Updated {count} files.")
