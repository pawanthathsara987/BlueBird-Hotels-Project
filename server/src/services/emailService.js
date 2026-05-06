/**
 * Email Service
 * Handles all email notifications for tour booking system
 */

import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper function to send emails
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.GMAIL_USER,
      to,
      subject: subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Email sent to ${to}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Send inquiry confirmation email to guest
 * @param {Object} inquiry - Tour inquiry object
 */
export const sendInquiryConfirmationEmail = async (inquiry) => {
  try {
    const subject = `Tour Inquiry Received - Reference: ${inquiry.inquiryRef}`;
    
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .section { margin: 20px 0; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #3b82f6; }
            .button { background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tour Inquiry Received!</h1>
              <p>Thank you for your interest in our tours</p>
            </div>
            
            <div class="content">
              <div class="section">
                <p>Dear ${inquiry.fullName},</p>
                <p>We have received your inquiry and our team is reviewing your request. You will hear from us within 24 hours.</p>
              </div>
              
              <div class="section">
                <h3>Your Inquiry Details:</h3>
                <div class="details">
                  <p><strong>Reference Number:</strong> ${inquiry.inquiryRef}</p>
                  <p><strong>Email:</strong> ${inquiry.email}</p>
                  <p><strong>Phone:</strong> ${inquiry.phone}</p>
                  <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
                  <p><strong>Travelers:</strong> ${inquiry.numberOfAdults} Adult(s), ${inquiry.numberOfChildren} Child(ren)</p>
                  <p><strong>Pickup Location:</strong> ${inquiry.pickupLocation}</p>
                </div>
              </div>
              
              <div class="section">
                <p>Once your inquiry is approved, we will send you payment details and a secure link to complete your booking.</p>
              </div>
              
              <div class="footer">
                <p>If you have any questions, please reply to this email or contact us at support@bluebird-hotels.com</p>
                <p>Best regards,<br/>BlueJay Hotels Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending inquiry confirmation email:", error);
    throw error;
  }
};

/**
 * Send booking confirmation email to guest with payment link
 * @param {Object} inquiry - Tour inquiry object
 * @param {Object} booking - Tour booking object
 */
export const sendBookingConfirmationEmail = async (inquiry, booking) => {
  try {
    const SITE_URL = process.env.FRONTEND_URL || "http://localhost:5174";
    const bookingStatusLink = `${SITE_URL}/booking/tour-status`;

    const subject = `Your Tour Booking is Confirmed - Ref: ${booking.bookingRef}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9fafb; padding: 30px 20px; }
            .section { margin: 20px 0; }
            .details { background-color: white; padding: 20px; border-left: 5px solid #667eea; border-radius: 4px; margin: 15px 0; }
            .pricing { background-color: white; padding: 20px; border: 2px solid #f59e0b; border-radius: 6px; margin: 20px 0; }
            .pricing table { width: 100%; }
            .pricing td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .button { background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; font-weight: bold; }
            .button-secondary { background-color: #3b82f6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px; margin-top: 10px; }
            .warning { background-color: #fef3c7; padding: 15px; border-left: 5px solid #f59e0b; border-radius: 4px; margin: 20px 0; }
            .timeline { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .timeline-item { margin: 15px 0; padding-left: 30px; position: relative; }
            .timeline-item:before { content: ""; position: absolute; left: 0; width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #10b981; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
            .button-container { margin: 20px 0; }
            .highlight { background-color: #fef3c7; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your tour adventure is ready to begin</p>
            </div>
            
            <div class="content">
              <div class="section">
                <p>Dear <strong>${inquiry.fullName}</strong>,</p>
                <p>Congratulations! Your tour inquiry has been accepted and your booking is now confirmed. We're excited to welcome you on this amazing journey!</p>
              </div>
              
              <div class="details">
                <h3 style="margin-top: 0; color: #667eea;">📋 Booking Reference</h3>
                <p style="font-size: 18px; font-weight: bold; color: #667eea; margin: 10px 0;">${booking.bookingRef}</p>
                <p style="font-size: 12px; color: #666; margin: 5px 0;">Save this reference for your records</p>
              </div>
              
              <div class="details">
                <h3 style="margin-top: 0;">Tour Details</h3>
                <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Travelers:</strong> ${inquiry.numberOfAdults} Adult(s)${inquiry.numberOfChildren > 0 ? `, ${inquiry.numberOfChildren} Child(ren)` : ''}</p>
                <p><strong>Pickup Location:</strong> ${inquiry.pickupLocation}</p>
              </div>
              
              <div class="pricing">
                <h3 style="margin-top: 0; margin-bottom: 15px;">💰 Tour Cost</h3>
                <table>
                  <tr>
                    <td><strong>Total Tour Cost:</strong></td>
                    <td style="text-align: right;"><strong style="font-size: 16px; color: #667eea;">LKR ${Number(booking.totalAmount).toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border: none; height: 10px;"></td>
                  </tr>
                  <tr style="background-color: #f0fdf4;">
                    <td><span class="highlight">✓ 50% Advance:</span></td>
                    <td style="text-align: right;"><strong style="font-size: 16px; color: #10b981;">LKR ${Number(booking.depositAmount).toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <td>Remaining 50% (Due later):</td>
                    <td style="text-align: right;">LKR ${Number(booking.remainingAmount).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div class="warning">
                <strong>⏰ Action Required:</strong><br>
                Please visit our website to complete your booking payment. Your payment link will be available on the tour details page.
              </div>
              
              <div class="timeline">
                <h3 style="margin-top: 0; margin-bottom: 20px;">📅 Next Steps</h3>
                <div class="timeline-item">
                  <strong>Step 1:</strong> Visit the tour page on our website
                </div>
                <div class="timeline-item">
                  <strong>Step 2:</strong> Click on "Book Now" or "Complete Payment" button
                </div>
                <div class="timeline-item">
                  <strong>Step 3:</strong> Enter your booking reference: <strong>${booking.bookingRef}</strong>
                </div>
                <div class="timeline-item">
                  <strong>Step 4:</strong> Complete your 50% advance payment
                 </div>
                 <div class="timeline-item">
                  <strong>Step 5:</strong> Enjoy your tour on ${new Date(inquiry.startDate).toLocaleDateString()}
                </div>
              </div>
              
              <div class="section">
                <h3>Need Help?</h3>
                <p>
                  📧 Email: <a href="mailto:support@bluebird-hotels.com">support@bluebird-hotels.com</a><br>
                  📱 Phone: +94 XXX XXX XXXX<br>
                  🌐 Visit: <a href="${bookingStatusLink}">Check Your Booking</a>
                </p>
              </div>
              
              <div class="footer">
                <p style="margin-top: 15px;">
                  <strong>Refund Policy:</strong> Cancellations are eligible for refunds only if made at least 4 days before the tour start date. For cancellations, please visit your booking status page.
                </p>
                <p style="margin-top: 15px;">Best regards,<br><strong>BlueJay Hotels Team</strong></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw error;
  }
};

/**
 * Send payment successful email
 * @param {Object} inquiry - Tour inquiry object
 * @param {Object} booking - Tour booking object
 */
export const sendPaymentSuccessEmail = async (inquiry, booking) => {
  try {
    const SITE_URL = process.env.FRONTEND_URL || "http://localhost:5174";
    const trackingLink = `${SITE_URL}/booking/track?bookingId=${booking.id}&token=${booking.trackingToken}`;

    const subject = `Payment Received - Booking ${booking.bookingRef}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .success-badge { background-color: #d1fae5; color: #065f46; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-weight: bold; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #059669; }
            .button { background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Payment Received!</h1>
            </div>
            
            <div class="content">
              <div class="success-badge">
                50% Advance Payment Confirmed
              </div>
              
              <p>Dear ${inquiry.fullName},</p>
              <p>Thank you! We have received your 50% advance payment. Your tour booking is now confirmed.</p>
              
              <div class="details">
                <p><strong>Booking Reference:</strong> ${booking.bookingRef}</p>
                <p><strong>Amount Paid:</strong> LKR ${Number(booking.depositAmount).toLocaleString()}</p>
                <p><strong>Remaining Balance:</strong> LKR ${Number(booking.remainingAmount).toLocaleString()}</p>
                <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${trackingLink}" class="button">📍 Track Your Booking</a>
              </p>
              
              <p style="margin-top: 30px;">
                Your booking confirmation and tour details have been sent to your email. 
                We will contact you closer to your tour date with final instructions.
              </p>
              
              <div style="margin-top: 30px; padding: 15px; background-color: white; border-left: 4px solid #3b82f6;">
                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Check your email for tour details and itinerary</li>
                  <li>Complete remaining 50% payment before tour date</li>
                  <li>Contact us for any special requests or questions</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending payment success email:", error);
    throw error;
  }
};

/**
 * Send payment reminder email (before 48-hour deadline)
 * @param {Object} inquiry - Tour inquiry object
 * @param {Object} booking - Tour booking object
 * @param {number} hoursRemaining - Hours remaining to pay
 */
export const sendPaymentReminderEmail = async (inquiry, booking, hoursRemaining) => {
  try {
    const SITE_URL = process.env.FRONTEND_URL || "http://localhost:5174";
    const paymentLink = `${SITE_URL}/booking/payment?bookingId=${booking.id}&token=${booking.paymentToken}`;

    const subject = `⏰ Payment Reminder - ${hoursRemaining} Hours Left`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .warning { background-color: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .button { background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Payment Reminder</h1>
              <p>Complete your payment to secure your booking</p>
            </div>
            
            <div class="content">
              <div class="warning">
                <strong>Only ${hoursRemaining} hours left to complete payment!</strong>
              </div>
              
              <p>Dear ${inquiry.fullName},</p>
              <p>This is a reminder that your payment is due to secure your tour booking.</p>
              
              <p><strong>Booking Reference:</strong> ${booking.bookingRef}</p>
              <p><strong>Amount Due:</strong> LKR ${Number(booking.depositAmount).toLocaleString()}</p>
              <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
              
              <p style="margin-top: 30px;">
                <a href="${paymentLink}" class="button">Complete Payment Now</a>
              </p>
              
              <p style="margin-top: 20px; color: #666;">
                If payment is not completed within ${hoursRemaining} hours, your booking may be automatically cancelled.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending payment reminder email:", error);
    throw error;
  }
};

/**
 * Send inquiry rejection email
 * @param {Object} inquiry - Tour inquiry object
 * @param {string} reason - Rejection reason
 */
export const sendRejectionEmail = async (inquiry, reason) => {
  try {
    const subject = `Tour Inquiry Response - Reference: ${inquiry.inquiryRef}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #dc2626; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Tour Inquiry Unable to Process</h1>
              <p>We have reviewed your request</p>
            </div>
            
            <div class="content">
              <div class="section">
                <p>Dear ${inquiry.fullName},</p>
                <p>Thank you for your interest in our tours. Unfortunately, we are unable to proceed with your inquiry at this time.</p>
              </div>
              
              <div class="section">
                <h3>Inquiry Details:</h3>
                <div class="details">
                  <p><strong>Reference Number:</strong> ${inquiry.inquiryRef}</p>
                  <p><strong>Tour Date Requested:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> ${reason}</p>
                </div>
              </div>
              
              <div class="section">
                <p>If you have any questions or would like to discuss other tour options, please feel free to reach out to our team at support@bluebird-hotels.com or call us directly.</p>
              </div>
              
              <div class="footer">
                <p>We appreciate your interest and hope to assist you with future bookings.</p>
                <p>Best regards,<br/>BlueJay Hotels Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail(inquiry.email, subject, emailBody);
    return true;
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
};

/**
 * Send tour cancellation email
 * @param {Object} inquiry - Tour inquiry object
 * @param {Object} booking - Tour booking object
 * @param {string} reason - Cancellation reason
 */
export const sendCancellationEmail = async (inquiry, booking, reason) => {
  try {
    const subject = `Booking Cancelled - Reference: ${booking.bookingRef}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #6b7280; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Cancellation Confirmed</h1>
            </div>
            
            <div class="content">
              <p>Dear ${inquiry.fullName},</p>
              <p>Your tour booking has been cancelled.</p>
              
              <div class="details">
                <p><strong>Booking Reference:</strong> ${booking.bookingRef}</p>
                <p><strong>Cancellation Reason:</strong> ${reason}</p>
                <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
              </div>
              
              ${booking.refundStatus === "approved" ? `
                <p style="margin-top: 20px; color: #059669;">
                  <strong>✓ Your refund of LKR ${Number(booking.refundAmount).toLocaleString()} will be processed within 5-7 business days.</strong>
                </p>
              ` : `
                <p style="margin-top: 20px; color: #dc2626;">
                  <strong>Note:</strong> Unfortunately, this booking is not eligible for a refund as it was cancelled less than 24 hours before the tour date.
                </p>
              `}
              
              <p style="margin-top: 30px;">
                If you have any questions, please contact us at support@bluebird-hotels.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Nodemailer
    await sendEmail(inquiry.email, subject, emailBody);
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
};
