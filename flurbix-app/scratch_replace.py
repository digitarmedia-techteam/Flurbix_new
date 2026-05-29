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

flow_iterator = itertools.cycle(flows)

def replace_item(match):
    left, right = next(flow_iterator)
    original = match.group(0)
    
    # Replace automations_name
    original = re.sub(
        r'(<div[^>]*class="automations_name"[^>]*>)\s*.*?\s*(</div>)', 
        f'\\g<1>{left}\\g<2>', 
        original,
        flags=re.DOTALL
    )
    
    # Replace the text inside the div that follows </svg> inside automations_tag
    # We will look for <svg ...> ... </svg> \s* <div[^>]*> ... </div>
    original = re.sub(
        r'(</svg>\s*<div(?:[^>]*)>)\s*.*?\s*(</div>)',
        f'\\g<1>{right}\\g<2>',
        original,
        flags=re.DOTALL
    )
    
    return original

with open('e:/web/flurbix/flurbix-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all automations_item and replace them using the callback
new_content = re.sub(
    r'<div\s+(automations-top=""|automations-bottom="")\s+role="listitem"\s+class="automations_item\s+w-dyn-item">.*?</div>\s*</div>\s*</div>',
    replace_item,
    content,
    flags=re.DOTALL
)

with open('e:/web/flurbix/flurbix-app/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete. Let's check how many were replaced.")
