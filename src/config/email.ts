import nodemailer from 'nodemailer';

// A transporter is the connection to your email service
// It holds the SMTP credentials and reuses the connection for all emails
const transporter = nodemailer.createTransport({
  host: process.env['EMAIL_HOST'],
  port: Number(process.env['EMAIL_PORT']),

  // secure: true uses SSL (port 465)
  // secure: false uses TLS (port 587) — more common
  secure: false,

  auth: {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASS'],
  },
});

// sendEmail is a reusable function that wraps nodemailer's sendMail
// to: recipient email address
// subject: email subject line
// html: the email body as HTML
export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env['EMAIL_FROM'],
    to,
    subject,
    html,
  });
}

export default transporter;
