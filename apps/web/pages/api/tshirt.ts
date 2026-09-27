import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().min(8).max(20),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  organization: z.string().trim().min(1).max(120),
  design: z.enum(['open-source-tees-design-1', 'cosmic-expansion-design-2']),
  website: z.string().optional(),
});
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Check the registration details.' });
  if (parsed.data.website) return res.status(200).json({ message: 'Received' });
  const { MAIL_SERVER, MAIL_PORT, MAIL_USER, MAIL_PASS, CONTACT_EMAIL } = process.env;
  if (!MAIL_SERVER || !MAIL_PORT || !MAIL_USER || !MAIL_PASS || !CONTACT_EMAIL) return res.status(503).json({ error: 'Registration is unavailable.' });
  const { name, email, phone, size, organization, design } = parsed.data;
  try {
    const transport = nodemailer.createTransport({ host: MAIL_SERVER, port: Number(MAIL_PORT), secure: Number(MAIL_PORT) === 465, auth: { user: MAIL_USER, pass: MAIL_PASS } });
    await transport.sendMail({ from: MAIL_USER, to: CONTACT_EMAIL, replyTo: email, subject: `OSDC T-shirt registration: ${name}`, text: `Design: ${design}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSize: ${size}\nCollege / organization: ${organization}` });
    return res.status(200).json({ message: 'Received' });
  } catch (error) { console.error('T-shirt registration failed', error); return res.status(500).json({ error: 'Registration could not be sent.' }); }
}
