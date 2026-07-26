const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return res.status(415).json({ error: 'Invalid request format' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ error: 'Request not allowed' });
      }
    } catch {
      return res.status(403).json({ error: 'Request not allowed' });
    }
  }

  const body = req.body || {};
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 100);
  const business = clean(body.business, 120);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 254);
  const industry = clean(body.industry, 100);
  const message = clean(body.message, 2000);

  if (!name || !business || !phone || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please complete all required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEAD_TO_EMAIL;
  const sender = process.env.LEAD_FROM_EMAIL || 'Front Caller Website <onboarding@resend.dev>';

  if (!apiKey || !recipient) {
    console.error('Missing RESEND_API_KEY or LEAD_TO_EMAIL');
    return res.status(503).json({ error: 'Contact form is not configured yet' });
  }

  const emailText = [
    'New Front Caller website enquiry',
    '',
    `Name: ${name}`,
    `Business: ${business}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Industry: ${industry || 'Not provided'}`,
    '',
    'Message:',
    message || 'Not provided',
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: `New website enquiry from ${business}`,
        text: emailText,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Email provider error:', response.status, detail);
      return res.status(502).json({ error: 'Unable to send your request' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Lead form error:', error);
    return res.status(500).json({ error: 'Unable to send your request' });
  }
}
