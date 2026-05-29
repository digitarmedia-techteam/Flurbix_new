import os
import glob

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        content = content.replace("100 Billion", "5 Million")
        content = content.replace("100 billion", "5 million")
        content = content.replace("100B+", "5M+")
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    search_dir = "e:/web/flurbix/flurbix-app"
    extensions = ['*.html', '*.ts', '*.js', '*.jsx', '*.tsx']
    
    for root, dirs, files in os.walk(search_dir):
        # Skip node_modules and .git
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if any(file.endswith(ext.replace('*', '')) for ext in extensions):
                process_file(os.path.join(root, file))
