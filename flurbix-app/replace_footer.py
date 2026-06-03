import re

with open('e:/web/flurbix/flurbix-app/index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

m = re.search(r'(<footer class="footer_component">.*?</footer>)', index_content, re.DOTALL | re.IGNORECASE)
if not m:
    print('Footer not found in index.html')
    exit(1)

new_footer = m.group(1)
# Adjust paths for en/ subdirectory
new_footer = new_footer.replace('href="terms.html"', 'href="../terms.html"')
new_footer = new_footer.replace('href="privacy-policy.html"', 'href="../privacy-policy.html"')
new_footer = new_footer.replace('href="contact.html"', 'href="../contact.html"')

with open('e:/web/flurbix/flurbix-app/en/demo.html', 'r', encoding='utf-8') as f:
    demo_content = f.read()

demo_content_new = re.sub(r'<footer class="footer_component">.*?</footer>', new_footer, demo_content, flags=re.DOTALL | re.IGNORECASE)

with open('e:/web/flurbix/flurbix-app/en/demo.html', 'w', encoding='utf-8') as f:
    f.write(demo_content_new)

print('Footer successfully replaced in demo.html')
