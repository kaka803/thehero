import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderEmail = async (order) => {
  const { email, customerInfo, items, subtotal, discountAmount, total, _id, invoiceNumber } = order;
  const orderId = invoiceNumber || _id.toString().slice(-6).toUpperCase();

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-size: 11px; color: #666;">${item.variant}</div>
        ${item.taxAmount > 0 ? `<div style="font-size: 10px; color: #d3b673;">Inkl. MwSt: $${item.taxAmount.toFixed(2)}</div>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${((item.price * item.quantity) + (item.taxAmount || 0)).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"THE HERO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Bestellbestätigung ${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:companylogo" alt="THE HERO" style="height: 60px; width: auto; object-contain;" />
          <p style="color: #666; font-size: 14px;">Vielen Dank für Ihre Bestellung!</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; border-bottom: 2px solid #d3b673; padding-bottom: 5px;">Bestelldetails</h2>
          <p><strong>Bestellnummer:</strong> ${orderId}</p>
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
              <td colspan="2" style="padding: 8px 12px; text-align: right; color: #666;">Zwischensumme</td>
              <td style="padding: 8px 12px; text-align: right;">$${subtotal.toFixed(2)}</td>
            </tr>
            ${discountAmount > 0 ? `
            <tr>
              <td colspan="2" style="padding: 8px 12px; text-align: right; color: #d3b673;">Rabatt</td>
              <td style="padding: 8px 12px; text-align: right; color: #d3b673;">-$${discountAmount.toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right; border-top: 2px solid #eee;">Gesamt</td>
              <td style="padding: 12px; font-weight: bold; text-align: right; color: #d3b673; font-size: 18px; border-top: 2px solid #eee;">$${total.toFixed(2)}</td>
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
  const { email, customerInfo, items, total, _id, invoiceNumber } = order;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const orderId = invoiceNumber || _id.toString().slice(-6).toUpperCase();

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
    subject: `🚨 NEUE BESTELLUNG ${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fcfcfc;">
        <h1 style="color: #d3b673; border-bottom: 2px solid #d3b673; padding-bottom: 10px;">Neue Bestellung eingegangen!</h1>
        <p><strong>Bestellnummer:</strong> ${orderId}</p>
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

export const sendStatusUpdateEmail = async (order) => {
  const { email, customerInfo, status, trackingNumber, trackingLink, invoiceNumber, items, subtotal, discountAmount, total } = order;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-size: 11px; color: #666;">${item.variant}</div>
        ${item.taxAmount > 0 ? `<div style="font-size: 10px; color: #d3b673;">Inkl. MwSt: $${item.taxAmount.toFixed(2)}</div>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${((item.price * item.quantity) + (item.taxAmount || 0)).toFixed(2)}</td>
    </tr>
  `).join('');
  
  const statusLabels = {
    pending: 'Ausstehend',
    processing: 'In Bearbeitung',
    shipped: 'Versandt',
    delivered: 'Geliefert',
    cancelled: 'Storniert'
  };

  const statusColors = {
    pending: '#ffc107',
    processing: '#17a2b8',
    shipped: '#28a745',
    delivered: '#007bff',
    cancelled: '#dc3545'
  };

  const trackingLinkHtml = trackingNumber ? `
    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #d3b673;">
      <p style="margin: 0; font-weight: bold;">Sendungsverfolgung:</p>
      <p style="margin: 5px 0 0;"><strong>Tracking-Nummer:</strong> ${trackingNumber}</p>
      <p style="margin: 10px 0 0;">
        <a href="${trackingLink || `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`}" 
           style="background-color: #d3b673; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
           Sendung verfolgen
        </a>
      </p>
    </div>
  ` : '';

  const mailOptions = {
    from: `"THE HERO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update zu Ihrer Bestellung ${invoiceNumber || ''} - Status: ${statusLabels[status] || status}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:companylogo" alt="THE HERO" style="height: 60px; width: auto; object-contain;" />
        </div>
        
        <h2 style="color: ${statusColors[status] || '#333'};">Bestellupdate</h2>
        <p>Hallo ${customerInfo.firstName},</p>
        <p>Der Status Ihrer Bestellung <strong>${invoiceNumber || ''}</strong> hat sich geändert auf: <strong>${statusLabels[status] || status}</strong>.</p>

        ${trackingLinkHtml}

        <div style="margin-top: 30px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #d3b673; padding-bottom: 5px;">Bestellübersicht</h3>
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
                <td colspan="2" style="padding: 8px 12px; text-align: right; color: #666;">Zwischensumme</td>
                <td style="padding: 8px 12px; text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 12px; text-align: right; color: #d3b673;">Rabatt</td>
                <td style="padding: 8px 12px; text-align: right; color: #d3b673;">-$${discountAmount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 12px; font-weight: bold; text-align: right; border-top: 2px solid #eee;">Gesamt</td>
                <td style="padding: 12px; font-weight: bold; text-align: right; color: #d3b673; font-size: 18px; border-top: 2px solid #eee;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #d3b673; padding-bottom: 5px;">Lieferadresse</h3>
          <p style="margin: 0; font-size: 14px;">${customerInfo.firstName} ${customerInfo.lastName}</p>
          <p style="margin: 0; font-size: 14px;">${customerInfo.address} ${customerInfo.apartment || ''}</p>
          <p style="margin: 0; font-size: 14px;">${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}</p>
          <p style="margin: 0; font-size: 14px;">${customerInfo.country}</p>
        </div>

        <p style="margin-top: 20px;">Vielen Dank für Ihre Bestellung!</p>
        
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
    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error };
  }
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"THE HERO CONTACT" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `Kontaktanfrage: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fcfcfc;">
        <h1 style="color: #d3b673; border-bottom: 2px solid #d3b673; padding-bottom: 10px;">Neue Kontaktanfrage</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Betreff:</strong> ${subject}</p>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff; border: 1px solid #eee; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold; margin-bottom: 10px;">Nachricht:</p>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error: error.message };
  }
};
