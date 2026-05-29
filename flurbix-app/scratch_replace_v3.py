import re
import itertools

flows = [
    ("WEBSITE URL ADDED", "AI BRAND ANALYSIS"),
    ("LINKEDIN PROFILE DETECTED", "VERIFIED CONTACT EXTRACTION"),
    ("APP ID SUBMITTED", "COMPANY INTELLIGENCE GENERATED"),
    ("DECISION-MAKER FOUND", "PERSONALIZED EMAIL CREATED"),
    ("OUTREACH CAMPAIGN STARTED", "FOLLOW-UP SEQUENCE ACTIVATED"),
    ("EMAIL OPENED", "RESPONSE TRACKING ENABLED"),
    ("NEW LEAD CAPTURED", "CRM PROFILE GENERATED"),
    ("TARGET CATEGORY SELECTED", "AI PROSPECT MATCHING"),
    ("CONTACT VERIFIED", "SMART OUTREACH SENT"),
    ("CAMPAIGN LAUNCHED", "REAL-TIME ANALYTICS LIVE"),
    ("REPLY RECEIVED", "SALES PIPELINE UPDATED"),
    ("DOMAIN HEALTH CHECKED", "DELIVERABILITY OPTIMIZED"),
    ("CLIENT ONBOARDED", "WORKFLOW AUTOMATION ENABLED"),
    ("FOLLOW-UP TIME REACHED", "HUMANIZED EMAIL SENT"),
    ("LEAD SOURCE IDENTIFIED", "ATTRIBUTION DATA SYNCED"),
    ("TEAM MEMBER INVITED", "ROLE ACCESS ASSIGNED"),
    ("EMAIL BOUNCE DETECTED", "MAILBOX HEALTH PROTECTED"),
    ("CAMPAIGN PERFORMANCE UPDATED", "AI INSIGHTS GENERATED"),
    ("TARGET URL ANALYZED", "DECISION-MAKER DISCOVERED"),
    ("OUTREACH SEQUENCE COMPLETED", "CONVERSION REPORT GENERATED"),
    ("NEW CLIENT REQUEST", "AI ONBOARDING STARTED"),
    ("CONTACT DATABASE UPDATED", "VERIFIED LEADS ADDED"),
    ("MULTI-MAILBOX CONNECTED", "SENDING NETWORK ACTIVATED"),
    ("USER SIGNED UP", "AUTOMATION WORKSPACE CREATED"),
    ("AD PLATFORM CONNECTED", "PERFORMANCE DATA UNIFIED"),
    ("ANALYTICS THRESHOLD REACHED", "ALERT NOTIFICATION SENT"),
    ("LEAD INTEREST DETECTED", "PRIORITY FOLLOW-UP INITIATED"),
    ("COMPANY PROFILE SCANNED", "AI OUTREACH DRAFT READY"),
    ("API WEBHOOK RECEIVED", "LIVE DATA SYNCHRONIZED"),
    ("CAMPAIGN GOAL ACHIEVED", "ROAS REPORT GENERATED")
]

with open('e:/web/flurbix/flurbix-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace pairs simultaneously so we don't desync.
# The structure is:
# <div class="automations_item w-dyn-item"> ... <div class="automations_name">LEFT</div> ... <svg class="automations_icon">...</svg><div>RIGHT</div> ... </div>

# Let's write a function that replaces the entire automations_item div safely.
flow_iterator = itertools.cycle(flows)

def replace_item(match):
    left, right = next(flow_iterator)
    item_content = match.group(0)
    
    # replace automations_name
    item_content = re.sub(
        r'(<div class="automations_name">)(.*?)(</div>)',
        lambda m: m.group(1) + left + m.group(3),
        item_content,
        flags=re.DOTALL
    )
    
    # replace the div right after automations_icon svg
    # The svg has class="automations_icon" or similar, ends with </svg>
    # Then there might be spaces/newlines, then a <div>
    item_content = re.sub(
        r'(class="automations_icon"[^>]*>.*?</svg>\s*<div[^>]*>)(.*?)(</div>)',
        lambda m: m.group(1) + right + m.group(3),
        item_content,
        flags=re.DOTALL
    )
    
    return item_content

# Match the wrapper of each item
# It starts with `<div automations-top="" role="listitem" class="automations_item w-dyn-item">` or similar
# The end of the item is where the next sibling starts or the parent ends. Since it has exactly one `automations_name`, 
# we can use lookarounds or just lazy matching up to the last `</div>` before the next item.
# Actually, since it's a fixed list, maybe it's better to just re.sub the individual parts but sharing the same iterator?
# But if we share the same iterator across two different re.sub calls, we can't guarantee they will match exactly the same 48 pairs in the same order if there's any discrepancy.
pass

# Let's just do two separate iterators. We proved there are exactly 48 of each.
iterator_left = itertools.cycle(flows)
def replace_left(match):
    left, _ = next(iterator_left)
    return f"{match.group(1)}{left}{match.group(3)}"
content = re.sub(r'(<div class="automations_name">)(.*?)(</div>)', replace_left, content, flags=re.DOTALL)

iterator_right = itertools.cycle(flows)
def replace_right(match):
    _, right = next(iterator_right)
    return f"{match.group(1)}{right}{match.group(3)}"
content = re.sub(r'(class="automations_icon"[^>]*>.*?</svg>\s*<div[^>]*>)(.*?)(</div>)', replace_right, content, flags=re.DOTALL)

with open('e:/web/flurbix/flurbix-app/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
