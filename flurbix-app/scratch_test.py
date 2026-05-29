import re

with open('e:/web/flurbix/flurbix-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

items = re.findall(r'class="automations_name"', content)
print('automations_name count:', len(items))

items2 = re.findall(r'<div\s+(automations-top=""|automations-bottom="")\s+role="listitem"\s+class="automations_item\s+w-dyn-item">', content)
print('automations_item wrapper count:', len(items2))
