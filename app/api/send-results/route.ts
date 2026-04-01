import { NextRequest, NextResponse } from "next/server";

const DIMENSIONS = [
  "Communication & Transparency",
  "Trust & Mutual Respect",
  "Decision-Making & Accountability",
  "Shared Vision & Direction",
  "Roles, Responsibility & Fairness",
];

function getScoreBandLabel(score: number): string {
  if (score >= 63) return "Thriving Partnership";
  if (score >= 48) return "Solid Foundation, Room to Grow";
  if (score >= 33) return "Under Strain";
  return "Needs Urgent Attention";
}

export async function POST(req: NextRequest) {
  const { firstName, email, totalScore, dimScores, contextAnswers, lowestDimension, contactMessage } =
    await req.json();

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const YOUR_EMAIL = process.env.YOUR_EMAIL ?? "tatyana@example.com";

  if (!RESEND_API_KEY) {
    return NextResponse.json({ ok: true, note: "No RESEND_API_KEY set" });
  }

  const bandLabel = getScoreBandLabel(totalScore);

  const dimBreakdown = DIMENSIONS.map(
    (name, i) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#1B2A4A;font-size:14px;">${name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:#1B2A4A;font-size:14px;">${dimScores[i]}/15</td>
    </tr>`
  ).join("");

  const dimBreakdownText = DIMENSIONS.map(
    (name, i) => `  ${name}: ${dimScores[i]}/15`
  ).join("\n");

  // Email to lead
  const leadHtml = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#F8F7F4;padding:0;">
      <div style="background:#1B2A4A;padding:32px 40px;text-align:center;">
        <p style="color:#C4953A;font-family:system-ui,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Partnership Health Assessment</p>
        <h1 style="color:#fff;font-size:26px;margin:0;line-height:1.3;">Your Results, ${firstName}</h1>
      </div>
      <div style="padding:32px 40px;">
        <div style="background:#fff;border-radius:12px;padding:28px;text-align:center;border:3px solid #C4953A;margin-bottom:24px;">
          <p style="color:#6B7C9B;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;font-family:system-ui,sans-serif;">Overall Score</p>
          <div style="font-size:64px;font-weight:800;color:#C4953A;line-height:1;">${totalScore}</div>
          <div style="font-size:13px;color:#8A9BB5;margin-bottom:12px;font-family:system-ui,sans-serif;">out of 75</div>
          <div style="background:#C4953A;color:#fff;display:inline-block;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;font-family:system-ui,sans-serif;">${bandLabel}</div>
        </div>

        <h2 style="color:#1B2A4A;font-size:18px;margin:0 0 16px;">Your 5 Dimensions</h2>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;margin-bottom:28px;">
          <thead>
            <tr style="background:#EEF2F8;">
              <th style="padding:10px 12px;text-align:left;color:#1B2A4A;font-size:13px;font-family:system-ui,sans-serif;">Dimension</th>
              <th style="padding:10px 12px;text-align:left;color:#1B2A4A;font-size:13px;font-family:system-ui,sans-serif;">Score</th>
            </tr>
          </thead>
          <tbody>${dimBreakdown}</tbody>
        </table>

        <p style="color:#4A5568;font-size:14px;line-height:1.7;font-family:system-ui,sans-serif;">Your lowest-scoring area — <strong>${lowestDimension}</strong> — is where focused attention will make the biggest difference.</p>

        <div style="background:#1B2A4A;border-radius:12px;padding:28px;text-align:center;margin-top:24px;">
          <h3 style="color:#fff;font-size:20px;margin:0 0 12px;">Book a Free Partnership Health Check</h3>
          <p style="color:#C8D4E8;font-size:14px;line-height:1.7;margin:0 0 20px;font-family:system-ui,sans-serif;">60 minutes to understand what your scores mean for your specific situation, and what to do next.</p>
          <a href="https://calendly.com/YOUR_LINK" style="background:#C4953A;color:#fff;display:inline-block;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;font-family:system-ui,sans-serif;">Book Now →</a>
        </div>
      </div>
    </div>
  `;

  // Notification to Tatyana
  const notifyHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#1B2A4A;">New Quiz Lead: ${firstName}</h2>
      <p><strong>Name:</strong> ${firstName}<br><strong>Email:</strong> ${email}</p>
      <p><strong>Score:</strong> ${totalScore}/75 — ${bandLabel}</p>
      <p><strong>Lowest dimension:</strong> ${lowestDimension}</p>
      <hr/>
      <h3>Dimension Scores</h3>
      <pre style="background:#f4f4f4;padding:12px;border-radius:6px;">${dimBreakdownText}</pre>
      <h3>Context Answers</h3>
      <ul>
        <li><strong>Partnership duration:</strong> ${contextAnswers.duration ?? "—"}</li>
        <li><strong>Formal agreement:</strong> ${contextAnswers.agreement ?? "—"}</li>
        <li><strong>What triggered taking the quiz:</strong> ${contextAnswers.trigger ?? "—"}</li>
      </ul>
      <p><strong>Suggested angle:</strong> Lead with ${lowestDimension} — that's their declared weak spot.</p>
      ${contactMessage ? `<h3>Their message to you</h3><blockquote style="border-left:3px solid #C4953A;margin:0;padding:12px 16px;background:#f9f6f0;color:#333;">${contactMessage}</blockquote>` : ""}
    </div>
  `;

  // Combined email to YOU — works without a verified domain.
  // The lead's email is in reply-to so you can reply directly to them.
  const combinedHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#1B2A4A;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h2 style="color:#C4953A;margin:0;font-size:20px;">New Quiz Lead: ${firstName}</h2>
        <p style="color:#C8D4E8;margin:8px 0 0;font-size:14px;">Score ${totalScore}/75 — ${bandLabel}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
        <p style="margin:0 0 8px;"><strong>Name:</strong> ${firstName}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p style="margin:0 0 20px;"><strong>Lowest dimension:</strong> ${lowestDimension}</p>
        <h3 style="color:#1B2A4A;margin:0 0 12px;">Dimension Scores</h3>
        <pre style="background:#fff;padding:12px;border-radius:6px;border:1px solid #e0e0e0;font-size:13px;">${dimBreakdownText}</pre>
        <h3 style="color:#1B2A4A;margin:16px 0 8px;">Context</h3>
        <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
          <li><strong>Duration:</strong> ${contextAnswers.duration ?? "—"}</li>
          <li><strong>Agreement:</strong> ${contextAnswers.agreement ?? "—"}</li>
          <li><strong>Trigger:</strong> ${contextAnswers.trigger ?? "—"}</li>
        </ul>
        ${contactMessage ? `<h3 style="color:#1B2A4A;margin:16px 0 8px;">Their message</h3><blockquote style="border-left:3px solid #C4953A;margin:0;padding:12px 16px;background:#fff;border-radius:0 6px 6px 0;font-size:14px;color:#333;">${contactMessage}</blockquote>` : ""}
        <hr style="margin:20px 0;border:none;border-top:1px solid #e0e0e0;"/>
        <p style="font-size:13px;color:#666;margin:0;">Hit reply to respond directly to ${firstName} at ${email}</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Partnership Health <onboarding@resend.dev>",
        to: [YOUR_EMAIL],
        reply_to: email,
        subject: `New Quiz Lead: ${firstName} — Score ${totalScore}/75`,
        html: combinedHtml,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return NextResponse.json({ ok: false, error: data }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
