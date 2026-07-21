import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'CityCare Hospital <noreply@citycare.com>';

const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      logger.info(`Email sent successfully to ${to} | Subject: ${subject}`);
    } else {
      logger.info(`[Email Service Logger] To: ${to} | Subject: ${subject}`);
    }
  } catch (err: any) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
  }
}

// Template Generators
export function generateEmailWrapper(title: string, bodyHtml: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; color: #38bdf8; }
          .body { padding: 30px; font-size: 14px; line-height: 1.6; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; font-weight: bold; border-radius: 20px; font-size: 12px; margin-bottom: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CityCare Smart Hospital</h1>
          </div>
          <div class="body">
            <div class="badge">${title}</div>
            ${bodyHtml}
          </div>
          <div class="footer">
            CityCare Hospital Management System &copy; 2026. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}
