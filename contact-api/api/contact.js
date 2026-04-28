// Vercel Serverless Function: Fakukac kapcsolat-űrlap kezelő
// A landing page űrlapját fogadja → emailt küld Tibinek (Resend API)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, msg, quote } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Hiányzó név vagy email.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Érvénytelen email cím.' });
    }

    await sendEmail({ name, email, phone, msg, quote });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ error: 'Belső hiba — kérlek próbáld újra később.' });
  }
}

function escapeHtml(s) {
  if (!s) return '—';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendEmail(data) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const TO_EMAIL = process.env.TO_EMAIL || 'tibor.fakukac@gmail.com';
  const CC_EMAIL = process.env.CC_EMAIL || 'zsoltipi@gmail.com';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#3a2516">
      <h2 style="color:#c97b40;margin:0 0 16px">🪵 Új ajánlatkérés a Fakukac oldalról</h2>

      <table style="width:100%;border-collapse:collapse;margin:0 0 20px">
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:8px;font-weight:bold;width:160px">Név</td>
          <td style="padding:8px">${escapeHtml(data.name)}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:8px;font-weight:bold">Email</td>
          <td style="padding:8px"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:8px;font-weight:bold">Telefon</td>
          <td style="padding:8px">${data.phone ? `<a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a>` : '—'}</td>
        </tr>
        ${data.quote ? `
        <tr style="border-bottom:1px solid #eee">
          <td style="padding:8px;font-weight:bold">Kalkulátor</td>
          <td style="padding:8px">${escapeHtml(data.quote)}</td>
        </tr>` : ''}
      </table>

      <h3 style="margin:0 0 8px">Üzenet</h3>
      <div style="background:#fbf6ee;padding:14px 16px;border-radius:10px;border:1px solid #e8dfd0;white-space:pre-wrap">${escapeHtml(data.msg) || '<em style="color:#888">(üzenet nélkül)</em>'}</div>

      <p style="color:#888;font-size:12px;margin:24px 0 0">
        Ez az üzenet a fakukac.hu landing oldal kapcsolat-űrlapjáról érkezett.<br>
        Válaszolj közvetlenül a fenti email címre.
      </p>
    </div>
  `;

  const subject = `🪵 Új ajánlatkérés — ${data.name}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      cc: CC_EMAIL,
      reply_to: data.email,
      subject,
      html
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend error: ${err}`);
  }
}
