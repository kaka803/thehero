import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderEmail = async (order) => {
  const { email, customerInfo, items, total, _id } = order;
  const orderId = _id.toString().slice(-6).toUpperCase();

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.variant})</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"THE HERO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Bestellbestätigung #HERO-${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:companylogo" alt="THE HERO" style="height: 60px; width: auto; object-contain;" />
          <p style="color: #666; font-size: 14px;">Vielen Dank für Ihre Bestellung!</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; border-bottom: 2px solid #d3b673; padding-bottom: 5px;">Bestelldetails</h2>
          <p><strong>Bestellnummer:</strong> #HERO-${orderId}</p>
          <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: left;">Artikel</th>
              <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: center;">Menge</th>
              <th style="padding: 12px; border-bottom: 2px solid #eee; text-align: right;">Preis</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right;">Gesamt</td>
              <td style="padding: 12px; font-weight: bold; text-align: right; color: #d3b673; font-size: 18px;">$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; border-bottom: 2px solid #d3b673; padding-bottom: 5px;">Lieferadresse</h2>
          <p style="margin: 0;">${customerInfo.firstName} ${customerInfo.lastName}</p>
          <p style="margin: 0;">${customerInfo.address} ${customerInfo.apartment || ''}</p>
          <p style="margin: 0;">${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}</p>
          <p style="margin: 0;">${customerInfo.country}</p>
        </div>

        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>&copy; ${new Date().getFullYear()} THE HERO. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    `,
    attachments: [{
      filename: 'logo.png',
      path: './public/logo.png',
      cid: 'companylogo'
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendAdminOrderNotification = async (order) => {
  const { email, customerInfo, items, total, _id, orderNumber } = order;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name} (${item.variant})</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"THE HERO SYSTEM" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 NEUE BESTELLUNG #HERO-${orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fcfcfc;">
        <h1 style="color: #d3b673; border-bottom: 2px solid #d3b673; padding-bottom: 10px;">Neue Bestellung eingegangen!</h1>
        <p><strong>Bestellnummer:</strong> #HERO-${orderNumber}</p>
        <p><strong>Kunde:</strong> ${customerInfo.firstName} ${customerInfo.lastName} (${email})</p>
        <p><strong>Gesamtbetrag:</strong> $${total.toFixed(2)}</p>

        <h2 style="font-size: 16px; margin-top: 20px;">Produkte:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #eee;">
              <th style="padding: 8px; text-align: left;">Artikel</th>
              <th style="padding: 8px; text-align: center;">Menge</th>
              <th style="padding: 8px; text-align: right;">Preis</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h2 style="font-size: 16px; margin-top: 20px;">Lieferadresse:</h2>
        <p style="margin: 0;">${customerInfo.firstName} ${customerInfo.lastName}</p>
        <p style="margin: 0;">${customerInfo.address} ${customerInfo.apartment || ''}</p>
        <p style="margin: 0;">${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}</p>
        <p style="margin: 0;">${customerInfo.country}</p>
        
        <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Action Required:</p>
          <p style="margin: 5px 0 0;">Bitte loggen Sie sich ins Admin-Dashboard ein, um die Bestellung zu bearbeiten.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
};

export const sendContactEmail = async (contactData) => {
  const { name, email, subject, message } = contactData;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"THE HERO CONTACT" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `📩 Neue Nachricht: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h1 style="color: #d3b673; border-bottom: 2px solid #d3b673; padding-bottom: 10px;">Neue Kontaktanfrage</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Betreff:</strong> ${subject}</p>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #d3b673; font-style: italic;">
          "${message}"
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          Diese E-Mail wurde über das Kontaktformular von THE HERO gesendet. Sie können direkt auf diese E-Mail antworten, um den Kunden zu kontaktieren.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
};

