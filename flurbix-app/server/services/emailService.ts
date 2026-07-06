import { env } from "../config/env";

export interface BookingEmailData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  website: string;
  linkedin: string;
  challenge: string;
  details: string;
  fullMeetingDetails: string;
  hangoutMeetUrl: string;
  googleCalUrl: string;
  outlookCalUrl: string;
  readableDate: string;
  meetingTimeStr: string;
  origin: string;
}

async function sendEmail(params: {
  to: string;
  bcc?: string;
  fromName: string;
  subject: string;
  bodyHtml: string;
}): Promise<void> {
  const isMockMode =
    !env.ELASTIC_EMAIL_API_KEY ||
    env.ELASTIC_EMAIL_API_KEY.includes("<") ||
    env.ELASTIC_EMAIL_API_KEY === "mock";

  if (isMockMode) {
    console.warn(
      `[Elastic Email Service] Running in MOCK mode. Simulated sending to: ${params.to} ${params.bcc ? `(BCC: ${params.bcc})` : ""}`,
    );
    console.log(`[Elastic Email Service] Subject: ${params.subject}`);
    return;
  }

  const payloadParams: Record<string, string> = {
    from: "noreply@flurbix.com",
    fromName: params.fromName,
    to: params.to,
    subject: params.subject,
    bodyHtml: params.bodyHtml,
    isTransactional: "true",
    charset: "utf-8",
    encodingType: "4",
    apikey: env.ELASTIC_EMAIL_API_KEY,
  };

  if (params.bcc) {
    payloadParams.bcc = params.bcc;
  }

  const payload = new URLSearchParams(payloadParams);

  const response = await fetch("https://api.elasticemail.com/v2/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  const result = (await response.json()) as {
    success: boolean;
    error?: string;
  };
  if (!result.success) {
    if (result.error === "APIKey Expired" && env.NODE_ENV === "development") {
      console.warn(
        `[Elastic Email Service] API Key is expired. Falling back to MOCK mode in development. Simulated sending to: ${params.to}`,
      );
      console.log(`[Elastic Email Service] Subject: ${params.subject}`);
      return;
    }
    throw new Error(result.error || "Elastic Email send failed");
  }
}

/** Internal sales notification email */
export async function sendSalesNotificationEmail(
  d: BookingEmailData,
): Promise<void> {
  const bodyHtml = `<div style="font-family:'Inter',Arial,sans-serif;color:#111827;max-width:600px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);background-color:#ffffff;">
  <div style="background-color:#0055FF;padding:24px;text-align:center;">
    <span style="font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:-0.04em;">Flurbi<span style="color:#000000;">x</span></span>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#0055FF;margin-top:0;font-size:22px;font-weight:700;">New Demo Session Scheduled</h2>
    <p style="font-size:15px;line-height:1.5;color:#4B5563;">A new demo session has been booked via the website. Here are the meeting details:</p>
    
    <div style="margin:20px 0;padding:16px;background-color:#EFF6FF;border-left:4px solid #0055FF;border-radius:4px;">
      <strong style="font-size:15px;color:#1e3a8a;">📅 Scheduled Time:</strong>
      <span style="font-size:16px;color:#111827;display:block;margin-top:4px;font-weight:600;">${d.fullMeetingDetails}</span>
      ${d.hangoutMeetUrl ? `<strong style="font-size:15px;color:#1e3a8a;display:block;margin-top:12px;">🎥 Google Meet:</strong><a href="${d.hangoutMeetUrl}" target="_blank" style="font-size:15px;color:#0055FF;display:block;margin-top:4px;text-decoration:underline;font-weight:600;">${d.hangoutMeetUrl}</a>` : ""}
    </div>

    <h3 style="font-size:16px;color:#111827;margin-top:28px;margin-bottom:12px;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Visitor Information</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
      <tr><td style="padding:10px 0;font-weight:600;width:150px;color:#4B5563;border-bottom:1px solid #F3F4F6;">Name</td><td style="padding:10px 0;color:#111827;border-bottom:1px solid #F3F4F6;font-weight:500;">${d.firstName} ${d.lastName}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Work Email</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;"><a href="mailto:${d.email}" style="color:#0055FF;text-decoration:none;font-weight:500;">${d.email}</a></td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Company</td><td style="padding:10px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.company || "N/A"}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Company Website</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;">${d.website ? `<a href="${d.website.startsWith("http") ? d.website : "https://" + d.website}" target="_blank" style="color:#0055FF;text-decoration:none;">${d.website}</a>` : "N/A"}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">LinkedIn Profile</td><td style="padding:10px 0;border-bottom:1px solid #F3F4F6;">${d.linkedin ? `<a href="${d.linkedin.startsWith("http") ? d.linkedin : "https://" + d.linkedin}" target="_blank" style="color:#0055FF;text-decoration:none;">${d.linkedin}</a>` : "N/A"}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Phone Number</td><td style="padding:10px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.phone || "N/A"}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Challenge</td><td style="padding:10px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.challenge}</td></tr>
      <tr><td style="padding:10px 0;font-weight:600;color:#4B5563;vertical-align:top;padding-top:12px;">Notes / Help Info</td><td style="padding:10px 0;color:#111827;padding-top:12px;line-height:1.5;">${d.details || "N/A"}</td></tr>
    </table>

    <div style="margin-top:32px;text-align:center;">
      <a href="${d.googleCalUrl}" target="_blank" style="display:inline-block;background-color:#0055FF;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Add to Google Calendar</a>
    </div>
  </div>
  <div style="background-color:#0055FF;padding:32px 24px;text-align:left;font-family:'Inter',Arial,sans-serif;color:white;">
    <div style="margin-bottom:24px;">
      <span style="font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:-0.04em;">Flurbi<span style="color:#000000;">x</span></span>
    </div>
    <div style="height:1px;background-color:rgba(255,255,255,0.2);margin-bottom:24px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;text-align:left;">
      <tr>
        <td valign="top" style="padding-bottom:16px;">
          <div style="max-width:220px;margin-bottom:16px;"> AI-powered sales outreach that helps businesses discover prospects, automate follow-ups, and close more deals</div>
        </td>
        <td valign="top" style="padding-left:16px;padding-bottom:16px;">
          <div style="margin-bottom:10px;">123 Innovation Drive<br>San Francisco, CA 94107<br>United States</div>
          <div style="margin-bottom:10px;"><a href="mailto:info@flurbix.com" style="color:rgba(255,255,255,0.7);text-decoration:none;">info@flurbix.com</a></div>
          <div>+1 (917) 967 1694</div>
        </td>
      </tr>
    </table>
    <div style="height:1px;background-color:rgba(255,255,255,0.2);margin-top:16px;margin-bottom:16px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:12px;color:rgba(255,255,255,0.6);">
      <tr>
        <td>© 2026 Flurbix. All rights reserved.</td>
        <td align="right">
          <a href="${d.origin}/terms" style="color:rgba(255,255,255,0.6);text-decoration:none;margin-right:16px;">Terms</a>
          <a href="${d.origin}/privacy-policy" style="color:rgba(255,255,255,0.6);text-decoration:none;">Privacy</a>
        </td>
      </tr>
    </table>
  </div>
</div>`;

  await sendEmail({
    to: "sales@flurbix.com,anuj@digitarmedia.com",
    fromName: "Flurbix Demo Booking",
    subject: `Demo Scheduled: ${d.company} on ${d.readableDate} at ${d.meetingTimeStr}`,
    bodyHtml,
  });
}

/** Customer confirmation email — same template as before, now sent server-side */
export async function sendCustomerConfirmationEmail(
  d: BookingEmailData,
): Promise<void> {
  const bodyHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Demo Booking Confirmed - Flurbix</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body{margin:0;padding:0;background-color:#f9fafb;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    @media screen and (max-width:600px){
      .email-container{width:100%!important;max-width:100%!important;border-radius:0!important;border-left:none!important;border-right:none!important;box-shadow:none!important;}
      .header-col-left{display:block!important;width:100%!important;text-align:center!important;padding:20px 20px 10px 20px!important;}
      .header-col-right{display:block!important;width:100%!important;text-align:center!important;padding:10px 20px 20px 20px!important;}
      .body-container{padding:32px 20px!important;}
      .footer-col{display:block!important;width:100%!important;padding:0!important;margin-top:0!important;margin-bottom:32px!important;text-align:center!important;}
    }
  </style>
</head>
<body style="margin:0;padding:24px 0;background-color:#f9fafb;font-family:'Inter',Arial,sans-serif;">
  <div class="email-container" style="font-family:'Inter',Arial,sans-serif;color:#111827;max-width:600px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;background-color:#ffffff;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background-color:#ffffff;border-bottom:1px solid #E5E7EB;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="header-col-left" align="left" valign="middle" style="padding:16px 24px;">
            <a href="${d.origin}" style="text-decoration:none;display:inline-block;">
              <img src="${d.origin}/logo.png" alt="Flurbix Logo" style="height:32px;vertical-align:middle;border:0;" />
            </a>
          </td>
          <td class="header-col-right" align="right" valign="middle" style="padding:16px 24px;font-family:'Inter',Arial,sans-serif;font-size:14px;">
            <a href="${d.origin}/about-us" style="color:#111827;text-decoration:none;margin-right:24px;font-weight:500;">About</a>
            <a href="${d.origin}/pricing" style="color:#111827;text-decoration:none;font-weight:500;">Pricing</a>
          </td>
        </tr>
      </table>
    </div>
    <div class="body-container" style="padding:40px 32px;background-color:#ffffff;">
      <h2 style="color:#111827;margin-top:0;font-size:24px;font-weight:700;">Your Demo is Confirmed!</h2>
      <p style="font-size:15px;line-height:1.6;color:#4B5563;margin-bottom:24px;">Hi ${d.firstName},</p>
      <p style="font-size:15px;line-height:1.6;color:#4B5563;margin-bottom:24px;">We are excited to schedule our personalized demo session with you. Here are your meeting details:</p>
      
      <div style="margin:24px 0;padding:18px;background-color:#EFF6FF;border-left:4px solid #0055FF;border-radius:4px;font-family:'Inter',Arial,sans-serif;">
        <strong style="font-size:14px;color:#1e3a8a;display:block;margin-bottom:4px;">📅 Date &amp; Time:</strong>
        <span style="font-size:16px;color:#111827;font-weight:600;">${d.fullMeetingDetails}</span>
        ${
          d.hangoutMeetUrl
            ? `<strong style="font-size:14px;color:#1e3a8a;display:block;margin-top:12px;margin-bottom:4px;">🎥 Google Meet:</strong><a href="${d.hangoutMeetUrl}" target="_blank" style="font-size:15px;color:#0055FF;font-weight:600;text-decoration:underline;">Join Google Meet</a>`
            : `<span style="font-size:14px;color:#4B5563;display:block;margin-top:6px;">Location: Online (Google Meet link will be in your calendar invite)</span>`
        }
      </div>

      <p style="font-size:15px;line-height:1.6;color:#4B5563;margin-bottom:24px;">A calendar invitation has been sent to your email. You can also manually add the session to your calendar using the buttons below.</p>
      <div style="margin:24px 0;text-align:center;">
        <a href="${d.googleCalUrl}" target="_blank" style="display:inline-block;background-color:#0055FF;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;margin-right:12px;margin-bottom:12px;">Add to Google Calendar</a>
        <a href="${d.outlookCalUrl}" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #D1D5DB;color:#374151;padding:11px 20px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;margin-bottom:12px;">Add to Outlook</a>
      </div>

      <h3 style="font-size:16px;color:#111827;margin-top:32px;margin-bottom:12px;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Summary of Your Request</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;margin-bottom:24px;">
        <tr><td style="padding:8px 0;font-weight:600;width:140px;color:#4B5563;border-bottom:1px solid #F3F4F6;">Name</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.firstName} ${d.lastName}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Work Email</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.email}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Company</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.company || "N/A"}</td></tr>
        <tr><td style="padding:8px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Challenge</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.challenge}</td></tr>
        ${d.phone ? `<tr><td style="padding:8px 0;font-weight:600;color:#4B5563;border-bottom:1px solid #F3F4F6;">Phone</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #F3F4F6;">${d.phone}</td></tr>` : ""}
      </table>

      <p style="font-size:15px;line-height:1.6;color:#4B5563;margin-bottom:32px;">If you need to reschedule or have any questions, feel free to reply directly to this email.</p>
      <p style="font-size:15px;line-height:1.6;color:#4B5563;margin:0;">Best regards,<br><strong style="color:#111827;">The Flurbix Team</strong></p>
    </div>
    <div style="background-color:#0055FF;padding:48px 32px 32px;text-align:left;font-family:'Inter',Arial,sans-serif;color:white;">
      <div style="margin-bottom:24px;">
        <span style="font-size:36px;font-weight:700;letter-spacing:-0.04em;color:#FFFFFF;line-height:1;">Flurbi<span style="color:#000000;">x</span></span>
      </div>
      <div style="height:1px;background-color:rgba(255,255,255,0.2);margin-bottom:32px;"></div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;text-align:left;">
        <tr>
          <td class="footer-col" valign="top" width="45%" style="padding-bottom:24px;">
            <div style="max-width:220px;margin-bottom:16px;"> AI-powered sales outreach that helps businesses discover prospects, automate follow-ups, and close more deals</div>
          </td>
          <td class="footer-col" valign="top" width="55%" style="padding-left:16px;padding-bottom:24px;">
            <div style="margin-bottom:12px;">123 Innovation Drive<br>San Francisco, CA 94107<br>United States</div>
            <div style="margin-bottom:12px;"><a href="mailto:info@flurbix.com" style="color:rgba(255,255,255,0.7);text-decoration:none;">info@flurbix.com</a></div>
            <div>+1 (917) 967 1694</div>
          </td>
        </tr>
      </table>
      <div style="height:1px;background-color:rgba(255,255,255,0.2);margin-top:16px;margin-bottom:32px;"></div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;color:rgba(255,255,255,0.6);">
        <tr>
          <td>© 2026 Flurbix. All rights reserved.</td>
          <td align="right">
            <a href="${d.origin}/terms" style="color:rgba(255,255,255,0.6);text-decoration:none;margin-right:20px;">Terms</a>
            <a href="${d.origin}/privacy-policy" style="color:rgba(255,255,255,0.6);text-decoration:none;margin-right:20px;">Privacy</a>
            <a href="${d.origin}/support" style="color:rgba(255,255,255,0.6);text-decoration:none;">Support</a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: d.email,
    fromName: "Flurbix",
    subject: `Confirmed: Flurbix Demo on ${d.readableDate} at ${d.meetingTimeStr}`,
    bodyHtml,
  });
}
