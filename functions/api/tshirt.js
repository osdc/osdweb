export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const name = clean(data.name, 100), email = clean(data.email, 200), phone = clean(data.phone, 20), size = clean(data.size, 4), organization = clean(data.organization, 120), design = clean(data.design, 50);
  if (data.website) return Response.json({ message: 'Received' });
  if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || phone.length < 8 || !['XS','S','M','L','XL','XXL'].includes(size) || !organization || !['open-source-tees-design-1','cosmic-expansion-design-2'].includes(design)) return Response.json({ error: 'Check the registration details.' }, { status: 400 });
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL || !env.TSHIRT_FROM_EMAIL) return Response.json({ error: 'Registration is unavailable.' }, { status: 503 });
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.TSHIRT_FROM_EMAIL, to: [env.CONTACT_EMAIL], reply_to: email, subject: `OSDC T-shirt registration: ${name}`, text: `Design: ${design}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSize: ${size}\nCollege / organization: ${organization}` }) });
  return response.ok ? Response.json({ message: 'Received' }) : Response.json({ error: 'Registration could not be sent.' }, { status: 502 });
}
export function onRequestGet() { return Response.json({ error: 'Method not allowed' }, { status: 405 }); }
