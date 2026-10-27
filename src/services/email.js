const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendInquiryNotification(inquiry) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log('[EMAIL] Skipping email — SMTP not configured. Inquiry saved to DB.');
    return;
  }

  const transport = getTransporter();

  const adminMailOptions = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🏗️ New Project Inquiry — ${inquiry.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A2E; color: #F0EFE9; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; border-bottom: 2px solid #C9A84C; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #C9A84C; margin: 0;">Suyog Constructions</h1>
          <p style="color: #A8A8B3; margin: 5px 0;">New Project Inquiry Received</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; color: #A8A8B3; width: 40%;">Name:</td><td style="padding: 8px; font-weight: bold;">${inquiry.name}</td></tr>
          <tr><td style="padding: 8px; color: #A8A8B3;">Email:</td><td style="padding: 8px;">${inquiry.email}</td></tr>
          <tr><td style="padding: 8px; color: #A8A8B3;">Phone:</td><td style="padding: 8px;">${inquiry.phone}</td></tr>
          <tr><td style="padding: 8px; color: #A8A8B3;">Service Type:</td><td style="padding: 8px; text-transform: capitalize;">${inquiry.service_type}</td></tr>
          <tr><td style="padding: 8px; color: #A8A8B3;">Budget Range:</td><td style="padding: 8px;">${inquiry.budget_range || 'Not specified'}</td></tr>
          <tr><td style="padding: 8px; color: #A8A8B3;">Location:</td><td style="padding: 8px;">${inquiry.project_location || 'Not specified'}</td></tr>
        </table>
        <div style="background: #16213E; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <p style="color: #A8A8B3; margin: 0 0 8px 0;">Message:</p>
          <p style="margin: 0;">${inquiry.message}</p>
        </div>
        <p style="color: #A8A8B3; font-size: 12px; margin-top: 20px; text-align: center;">
          This inquiry was submitted via the Suyog Constructions website.
        </p>
      </div>
    `,
  };

  // Auto-reply to customer
  const customerMailOptions = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
    to: inquiry.email,
    subject: `Thank you for contacting Suyog Constructions — We received your inquiry`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A2E; color: #F0EFE9; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 2px solid #C9A84C;">
          <h1 style="color: #C9A84C; margin: 0;">Suyog Constructions</h1>
        </div>
        <h2 style="color: #C9A84C;">Hello ${inquiry.name},</h2>
        <p>Thank you for reaching out to <strong>Suyog Constructions</strong>. We have successfully received your project inquiry.</p>
        <p>Our team will review your requirements and get back to you within <strong>24 hours</strong> to discuss your project further.</p>
        <div style="background: #16213E; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #C9A84C; margin: 0 0 8px 0; font-weight: bold;">Your Inquiry Details:</p>
          <p style="margin: 4px 0;"><strong>Service:</strong> ${inquiry.service_type}</p>
          ${inquiry.project_location ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${inquiry.project_location}</p>` : ''}
        </div>
        <p>For urgent matters, feel free to contact us directly:</p>
        <p>📞 <strong>${process.env.COMPANY_PHONE}</strong></p>
        <p>📧 <strong>${process.env.COMPANY_EMAIL}</strong></p>
        <p style="color: #A8A8B3; font-size: 12px; margin-top: 20px; text-align: center;">
          © 2024 Suyog Constructions. All rights reserved.
        </p>
      </div>
    `,
  };

  await Promise.all([
    transport.sendMail(adminMailOptions),
    transport.sendMail(customerMailOptions),
  ]);
}

async function sendContactNotification(contact) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log('[EMAIL] Skipping email — SMTP not configured.');
    return;
  }

  const transport = getTransporter();

  await transport.sendMail({
    from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📩 New Contact Message — ${contact.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; background: #1A1A2E; color: #F0EFE9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #C9A84C;">New Contact Message</h2>
        <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
        ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <div style="background: #16213E; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <p>${contact.message}</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendInquiryNotification, sendContactNotification };
