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
 * Send room booking confirmation email after a successful payment
 * @param {Object} booking - Reservation object with customer and booked rooms
 */
export const sendBookingConfirmationEmail = async (booking) => {
  try {
    const customer = booking.Customer;
    if (!customer?.email) {
      throw new Error("Customer email not found for booking confirmation");
    }

    const bookedRooms = Array.isArray(booking.bookedRooms) ? booking.bookedRooms : [];
    const roomSummary = bookedRooms
      .map((roomBooking, index) => {
        const room = roomBooking.Room;
        const packageName = room?.roomType?.type || "Room";
        const roomLabel = room?.roomNo || room?.roomNumber || room?.id || `Room ${index + 1}`;

        return `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${packageName}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${roomLabel}</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${roomBooking.checkIn} to ${roomBooking.checkOut}</td>
          </tr>
        `;
      })
      .join("");

    const subject = `Room Booking Confirmed - Reservation #${booking.id}`;
    const guestName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Guest";

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; }
            .header { background: #0f766e; color: #ffffff; padding: 24px; border-radius: 12px; }
            .section { margin-top: 24px; }
            .card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            .summary { width: 100%; border-collapse: collapse; font-size: 14px; }
            .summary th { text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 8px; }
            .footer { margin-top: 28px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Payment Received</h1>
              <p style="margin: 8px 0 0;">Your room booking is confirmed.</p>
            </div>

            <div class="section">
              <p>Dear ${guestName},</p>
              <p>We have received your payment successfully and your room reservation is now confirmed.</p>
            </div>

            <div class="section card">
              <p style="margin: 0 0 8px;"><strong>Reservation ID:</strong> #${booking.id}</p>
              <p style="margin: 0 0 8px;"><strong>Total Amount:</strong> $${Number(booking.total_price || 0).toLocaleString()}</p>
              <p style="margin: 0;"><strong>Guest Email:</strong> ${customer.email}</p>
            </div>

            <div class="section">
              <h3 style="margin: 0 0 12px;">Booking Details</h3>
              <table class="summary">
                <thead>
                  <tr>
                    <th>Room Type</th>
                    <th style="text-align: right;">Room</th>
                    <th style="text-align: right;">Stay Period</th>
                  </tr>
                </thead>
                <tbody>
                  ${roomSummary || `<tr><td colspan="3" style="padding: 12px 0; color: #6b7280;">No room details available.</td></tr>`}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>Please keep this email for your records. Our team will contact you if any additional information is needed.</p>
              <p>Best regards,<br/>BlueJay Hotels Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({ to: customer.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw error;
  }
};


/**
 * Send vehicle booking confirmation email after a successful reservation
 * @param {Object} options - Vehicle booking details
 * @param {string} options.email - Customer email
 * @param {string} options.name - Customer name
 * @param {string} options.bookingNo - Booking reference number
 * @param {string} options.vehicleName - Vehicle brand + model
 * @param {string} options.pickupDatetime - Pickup date
 * @param {string} options.returnDatetime - Return date
 * @param {number} options.numDays - Number of days
 * @param {string} options.hireType - 'with_driver' or 'without_driver'
 * @param {string} options.pickupLocation - Pickup location
 * @param {string} options.dropoffLocation - Dropoff location
 * @param {number} options.totalPayable - Total price
 * @param {number} options.depositAmount - 30% deposit
 * @param {number} options.balanceAmount - Remaining balance
 */
export const sendVehicleBookingConfirmationEmail = async (options) => {
  try {
    const {
      email, name, bookingNo, vehicleName,
      pickupDatetime, returnDatetime, numDays, hireType,
      pickupLocation, dropoffLocation,
      totalPayable, depositAmount, balanceAmount,
    } = options;

    if (!email) {
      throw new Error("Customer email not provided for vehicle booking confirmation");
    }

    const pickupFormatted = new Date(pickupDatetime).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    const returnFormatted = new Date(returnDatetime).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
    const driverLabel = hireType === 'with_driver' ? 'With Driver' : 'Self-Drive';

    const subject = `Vehicle Booking Confirmed - ${bookingNo}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; color: #1f2937; }
            .container { max-width: 640px; margin: 0 auto; background: #ffffff; padding: 0; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a, #0369a1); color: #ffffff; padding: 32px 24px; }
            .header h1 { margin: 0 0 8px; font-size: 24px; }
            .header p { margin: 0; opacity: 0.85; font-size: 14px; }
            .body { padding: 24px; }
            .section { margin-top: 20px; }
            .card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #6b7280; }
            .value { font-weight: 600; color: #1e293b; }
            .deposit-card { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin-top: 20px; }
            .deposit-amount { font-size: 32px; font-weight: 800; color: #1e40af; margin: 8px 0; }
            .balance-note { font-size: 13px; color: #6b7280; margin-top: 8px; }
            .footer { margin-top: 28px; padding: 20px 24px; background: #f8fafc; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Vehicle Reservation Confirmed</h1>
              <p>Your booking reference: <strong>${bookingNo}</strong></p>
            </div>

            <div class="body">
              <p>Dear ${name || 'Guest'},</p>
              <p>Your vehicle rental has been successfully reserved. Please find the details below.</p>

              <div class="section card">
                <div class="row">
                  <span class="label">Vehicle</span>
                  <span class="value">${vehicleName || 'Premium Vehicle'}</span>
                </div>
                <div class="row">
                  <span class="label">Hire Type</span>
                  <span class="value">${driverLabel}</span>
                </div>
                <div class="row">
                  <span class="label">Pickup Date</span>
                  <span class="value">${pickupFormatted}</span>
                </div>
                <div class="row">
                  <span class="label">Return Date</span>
                  <span class="value">${returnFormatted}</span>
                </div>
                <div class="row">
                  <span class="label">Duration</span>
                  <span class="value">${numDays} day${numDays > 1 ? 's' : ''}</span>
                </div>
                ${pickupLocation ? `
                <div class="row">
                  <span class="label">Pickup Location</span>
                  <span class="value">${pickupLocation}</span>
                </div>` : ''}
                ${dropoffLocation ? `
                <div class="row">
                  <span class="label">Dropoff Location</span>
                  <span class="value">${dropoffLocation}</span>
                </div>` : ''}
                <div class="row" style="border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 4px;">
                  <span class="label" style="font-weight: 600; color: #1e293b;">Total Price</span>
                  <span class="value" style="font-size: 18px; color: #0f172a;">$${Number(totalPayable || 0).toLocaleString()}</span>
                </div>
              </div>

              <div class="deposit-card">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; font-weight: 700;">Advance Deposit Required (30%)</div>
                <div class="deposit-amount">$${Number(depositAmount || 0).toLocaleString()}</div>
                <div class="balance-note">Remaining balance of <strong>$${Number(balanceAmount || 0).toLocaleString()}</strong> is payable at vehicle pickup.</div>
              </div>

              <div class="section" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; font-size: 13px;">
                <strong>⚠️ Important:</strong> Please pay the 30% deposit to confirm your reservation. Unpaid bookings will be automatically released after 24 hours.
              </div>
            </div>

            <div class="footer">
              <p>If you have any questions, please reply to this email or contact us at support@bluebird-hotels.com</p>
              <p>Best regards,<br/>BlueJay Hotels Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({ to: email, subject, html: emailBody });
    console.log(`[EMAIL] Vehicle booking confirmation sent to ${email} for ${bookingNo}`);
    return true;
  } catch (error) {
    console.error("Error sending vehicle booking confirmation email:", error);
    // Don't throw — email failure should not break the booking
    return false;
  }
};



/**
 * Send accepted inquiry quote email with manager-adjusted details
 * @param {Object} inquiry - Tour inquiry object
 * @param {Object} booking - Tour booking object
 * @param {Object} options - Additional email customizations
 */
export const sendAcceptedInquiryQuoteEmail = async (inquiry, booking, options = {}) => {
  try {
    const {
      packageName = "Selected Tour",
      tourBasePrice,
      totalAmount,
      adults,
      children,
      tourStartDate,
      managerNote,
    } = options;

    const totalGuests = Number(adults || 0) + Number(children || 0);

    const subject = `Tour Quote Ready - Ref: ${booking.bookingRef}`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0f766e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .section { margin: 20px 0; }
            .details { background-color: white; padding: 15px; border-left: 4px solid #0f766e; }
            .pricing { background-color: #ecfeff; border: 1px solid #99f6e4; padding: 15px; border-radius: 6px; }
            .note { background-color: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 6px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Tour Inquiry Was Accepted</h1>
              <p>We have prepared your personalized quote</p>
            </div>

            <div class="content">
              <div class="section">
                <p>Dear ${inquiry.fullName},</p>
                <p>Great news! Your inquiry has been accepted and your booking quote is now ready.</p>
              </div>

              <div class="section details">
                <h3 style="margin-top: 0;">📍 Tour Package Details</h3>
                <p style="font-size: 16px; font-weight: bold; color: #0f766e; margin: 8px 0;">${packageName}</p>
                <p style="margin: 8px 0;"><strong>Booking Reference:</strong> ${booking.bookingRef}</p>
                <p style="margin: 8px 0;"><strong>Tour Date:</strong> ${new Date(tourStartDate || inquiry.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0;"><strong>Travelers:</strong> ${Number(adults || 0)} Adult(s), ${Number(children || 0)} Child(ren)</p>
                <p style="margin: 8px 0;"><strong>Total Group Size:</strong> ${totalGuests}</p>
              </div>

              <div class="section pricing" style="background-color: #ecfeff; border: 2px solid #0f766e;">
                <h3 style="margin-top: 0; color: #0f766e;">💰 Full Price - Complete Tour Package</h3>
                
                <div style="background-color: white; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                  <p style="margin: 0; font-size: 13px; color: #666;"><strong>Tour Package Standard Price:</strong></p>
                  <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #0f766e;">$${Number(tourBasePrice || 0).toLocaleString()}</p>
                </div>

                ${tourBasePrice !== totalAmount ? `
                <div style="background-color: #f0fdf4; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #059669;">
                  <p style="margin: 0; font-size: 13px; color: #666;"><strong>Your Customized Tour Package Price:</strong></p>
                  <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #059669;">$${Number(totalAmount || 0).toLocaleString()}</p>
                </div>
                ` : ''}

                <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 12px 0;">

                <div style="background-color: white; padding: 12px; border-radius: 6px;">
                  <p style="margin: 8px 0; font-size: 14px;"><strong>📍 Tour Package Includes ${totalGuests} Guest(s)</strong></p>
                  <table style="width: 100%; font-size: 14px; margin-top: 10px;">
                    <tr>
                      <td><strong>Total Tour Package Cost:</strong></td>
                      <td style="text-align: right;"><strong style="font-size: 16px; color: #0f766e;">$${Number(booking.totalAmount || 0).toLocaleString()}</strong></td>
                    </tr>
                  </table>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">

                  <p style="margin: 6px 0; font-size: 13px;"><strong>📌 Advance Payment (50%):</strong> <span style="color: #059669; font-weight: bold; font-size: 15px;">$${Number(booking.depositAmount || 0).toLocaleString()}</span></p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>📌 Remaining (50%, Due Later):</strong> <span style="font-weight: bold;">$${Number(booking.remainingAmount || 0).toLocaleString()}</span></p>
                </div>
              </div>

              ${managerNote ? `
                <div class="section note">
                  <h3 style="margin-top: 0;">Note From Our Team</h3>
                  <p style="white-space: pre-wrap;">${managerNote}</p>
                </div>
              ` : ""}

              <div class="footer">
                <p>Please use your booking reference for future communication.</p>
                <p>Best regards,<br/>BlueJay Hotels Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending accepted inquiry quote email:", error);
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
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
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
                  <strong>✓ Your refund of $${Number(booking.refundAmount).toLocaleString()} will be processed within 5-7 business days.</strong>
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
    await sendEmail({ to: inquiry.email, subject, html: emailBody });
    return true;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
};
