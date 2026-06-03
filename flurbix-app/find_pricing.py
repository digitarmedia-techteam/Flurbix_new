with open(r"e:\web\flurbix\flurbix-app\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if "Pricing" in line or "pricing" in line:
        print(f"{i+1}: {line.strip()}")
