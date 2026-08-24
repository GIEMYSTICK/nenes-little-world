import nodemailer from "nodemailer";

export const SITE_CONTACT_EMAIL = "jiminun1@gmail.com";

export function createMailTransport() {
  const user = process.env.SMTP_USER || process.env.email;
  const pass = process.env.SMTP_APP_PASSWORD || process.env.app_password;
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || process.env.smtp_port || 465);
  return {
    user,
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST || process.env.smtp_host || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
  };
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] ?? character);
}
