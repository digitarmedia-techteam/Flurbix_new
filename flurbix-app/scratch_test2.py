import re

with open('e:/web/flurbix/flurbix-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

items = re.findall(r'class="automations_icon"[^>]*>.*?</svg>\s*<div[^>]*>.*?</div>', content, re.DOTALL)
print('automations_icon + div count:', len(items))
