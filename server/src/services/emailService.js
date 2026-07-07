import nodemailer from "nodemailer";
import axios from 'axios';
import { RoomPayment, AirPortPickup, Policy, BookedRoom } from '../models/index.js';

const getCurrencyType = () => process.env.CURRENCY_TYPE || 'LKR';

const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: (parseInt(process.env.SMTP_PORT) || 587) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {  
        rejectUnauthorized: false
      }
    });

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  fromName,
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"${fromName || process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email Error:", error);
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
    const totalGuests = bookedRooms.reduce((sum, r) => sum + (Number(r.adults) || 1) + (Number(r.kids) || 0), 0);

    // Fetch related payment, pickup and policy records
    const payments = await RoomPayment.findAll({ where: { booking_id: booking.id, status: 'success' } });
    const paidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const latestPayment = payments[payments.length - 1];
    
    const transactionId = latestPayment ? latestPayment.payment_no : 'N/A';
    const paymentMethod = latestPayment ? latestPayment.method : 'N/A';
    const paymentStatus = latestPayment ? latestPayment.status.toUpperCase() : (booking.status === 'confirmed' ? 'SUCCESS' : 'PENDING');

    const airportPickup = await AirPortPickup.findOne({ where: { booking_id: booking.id } });
    const policy = await Policy.findOne({ where: { status: true } });
    const cancellationPolicyLink = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/return-policy` : 'https://bluebird-hotels.com/return-policy';
    const cancellationPolicyText = policy ? policy.cancellation_policy : 'Cancellations must be made at least 24 hours prior to check-in for a full refund.';

    // Construct room details row using standard table layout
    const roomSummary = bookedRooms
      .map((roomBooking, index) => {
        const room = roomBooking.Room;
        const packageName = room?.roomType?.type || "Room Stay";
        const roomLabel = room?.room_number || room?.roomNo || room?.id || `Room ${index + 1}`;
        const boardType = roomBooking.board_type || "Room Only";

        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 8px; text-align: left;">${packageName}</td>
            <td style="padding: 12px 8px; text-align: center;">${roomLabel}</td>
            <td style="padding: 12px 8px; text-align: center;">${boardType}</td>
            <td style="padding: 12px 8px; text-align: right;">${roomBooking.checkIn} to ${roomBooking.checkOut}</td>
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
            body { font-family: Arial, sans-serif; background: #f8fafc; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 640px; margin: 20px auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #064e3b, #0f766e); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
            .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
            .body { padding: 24px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0f766e; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
            .card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            .table-container { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
            .summary { width: 100%; border-collapse: collapse; font-size: 14px; }
            .summary th { background: #f8fafc; text-align: left; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
            .summary td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
            .summary tr:last-child td { border-bottom: none; }
            .row-table { width: 100%; border-collapse: collapse; font-size: 14px; }
            .row-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .row-table tr:last-child td { border-bottom: none; }
            .label { color: #6b7280; font-weight: 550; text-align: left; }
            .value { font-weight: 600; color: #1e293b; text-align: right; }
            .badge-success { background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
            .badge-pending { background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
            .footer { padding: 24px; background: #f8fafc; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Receipt & Confirmation</h1>
              <p>BlueBird Hotels Reservation Confirmation</p>
            </div>

            <div class="body">
              <div class="section">
                <p>Dear ${guestName},</p>
                <p>Thank you for choosing BlueBird Hotels. Your payment has been received, and your room booking is now successfully confirmed.</p>
              </div>

              <!-- Guest Profile Details -->
              <div class="section">
                <div class="section-title">Guest Profile details</div>
                <div class="card" style="padding: 8px 16px;">
                  <table class="row-table">
                    <tr>
                      <td class="label" style="width: 40%;">Name</td>
                      <td class="value">${guestName}</td>
                    </tr>
                    <tr>
                      <td class="label">Email Address</td>
                      <td class="value">${customer.email}</td>
                    </tr>
                    <tr>
                      <td class="label">Contact Number</td>
                      <td class="value">${customer.phoneNumber || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Total Guests</td>
                      <td class="value">${totalGuests} Guests</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Room Stay Details -->
              <div class="section">
                <div class="section-title">Room Stay Details</div>
                <div class="table-container">
                  <table class="summary">
                    <thead>
                      <tr>
                        <th style="text-align: left;">Room Type</th>
                        <th style="text-align: center;">Room No</th>
                        <th style="text-align: center;">Board Type</th>
                        <th style="text-align: right;">Stay Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${roomSummary || `<tr><td colspan="4" style="padding: 12px 8px; text-align: center; color: #6b7280;">No stay details available.</td></tr>`}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Additional Service: Airport Pickup -->
              <div class="section">
                <div class="section-title">Additional Service details</div>
                <div class="card" style="padding: 8px 16px;">
                  <table class="row-table">
                    <tr>
                      <td class="label" style="width: 40%;">Airport Pickup Shuttle</td>
                      <td class="value">
                        ${airportPickup ? `<span class="badge-success">REQUESTED</span>` : `<span style="color: #6b7280;">Not Requested</span>`}
                      </td>
                    </tr>
                    ${airportPickup ? `
                    <tr>
                      <td class="label">Pickup Location</td>
                      <td class="value">${airportPickup.pickup_location || 'Katunayake Airport'}</td>
                    </tr>
                    <tr>
                      <td class="label">Shuttle Schedule</td>
                      <td class="value">${airportPickup.pickup_date} at ${airportPickup.pickup_time}</td>
                    </tr>
                    <tr>
                      <td class="label">Passenger Count</td>
                      <td class="value">${airportPickup.passenger_count} Passenger(s)</td>
                    </tr>
                    <tr>
                      <td class="label">Pickup Status</td>
                      <td class="value" style="color: #0f766e; font-weight: 700;">${airportPickup.status}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </div>

              <!-- Payment Details -->
              <div class="section">
                <div class="section-title">Payment & Billing Summary</div>
                <div class="card" style="padding: 8px 16px;">
                  <table class="row-table">
                    <tr>
                      <td class="label" style="width: 40%;">Booking Reference ID</td>
                      <td class="value">#${booking.id}</td>
                    </tr>
                    <tr>
                      <td class="label">Booking Status</td>
                      <td class="value" style="color: #064e3b; font-weight: 700; text-transform: uppercase;">${booking.status}</td>
                    </tr>
                    <tr>
                      <td class="label">Total Amount Price</td>
                      <td class="value">${getCurrencyType()} ${Number(booking.total_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td class="label">Paid Amount (Advance)</td>
                      <td class="value" style="color: #065f46; font-weight: 700;">
                        ${getCurrencyType()} ${Number(paidAmount || Number(booking.total_price) * 0.5).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td class="label">Transaction Reference ID</td>
                      <td class="value">${transactionId}</td>
                    </tr>
                    <tr>
                      <td class="label">Payment Method</td>
                      <td class="value" style="text-transform: capitalize;">${paymentMethod}</td>
                    </tr>
                    <tr>
                      <td class="label">Payment Status</td>
                      <td class="value">
                        <span class="${paymentStatus === 'SUCCESS' ? 'badge-success' : 'badge-pending'}">${paymentStatus}</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Cancellation Policy -->
              <div class="section">
                <div class="section-title">Cancellation Policy & Terms</div>
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; font-size: 13px;">
                  <p style="margin: 0 0 10px; color: #92400e; font-weight: bold; line-height: 1.4;">
                    ${cancellationPolicyText}
                  </p>
                  <a href="${cancellationPolicyLink}" style="color: #0f766e; font-weight: 700; text-decoration: underline;" target="_blank">
                    Read Full Cancellation Policy Online
                  </a>
                </div>
              </div>
            </div>

            <!-- Customer Support Footer -->
            <div class="footer">
              <p style="margin: 0 0 8px; font-weight: bold; color: #1f2937;">Need Assistance or Support?</p>
              <p style="margin: 4px 0;"><strong>Phone Support Contact:</strong> ${process.env.SUPPORT_CONTACT}</p>
              <p style="margin: 4px 0;"><strong>Email Support Contact:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #0f766e; text-decoration: none;">${process.env.SUPPORT_EMAIL}</a></p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
              <p style="margin: 0; font-size: 11px;">Please keep this receipt as proof of payment. We look forward to welcoming you.</p>
              <p style="margin: 4px 0 0; font-size: 11px;">&copy; ${new Date().getFullYear()} BlueBird Hotels. All rights reserved.</p>
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
                  <span class="value" style="font-size: 18px; color: #0f172a;">${getCurrencyType()} ${Number(totalPayable || 0).toLocaleString()}</span>
                </div>
              </div>

              <div class="deposit-card">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; font-weight: 700;">Advance Deposit Required (50%)</div>
                <div class="deposit-amount">${getCurrencyType()} ${Number(depositAmount || 0).toLocaleString()}</div>
                <div class="balance-note">Remaining balance of <strong>${getCurrencyType()} ${Number(balanceAmount || 0).toLocaleString()}</strong> is payable at vehicle pickup.</div>
              </div>

              <div class="section" style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; font-size: 13px;">
                <strong>⚠️ Important:</strong> Please pay the 50% deposit to confirm your reservation. Unpaid bookings will be automatically released after 2 hours.
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
                <p>Great news! Your inquiry has been accepted. To complete your tour booking, please pay the 50% advance payment.</p>
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
                  <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #0f766e;">${getCurrencyType()} ${Number(tourBasePrice || 0).toLocaleString()}</p>
                </div>

                ${tourBasePrice !== totalAmount ? `
                <div style="background-color: #f0fdf4; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #059669;">
                  <p style="margin: 0; font-size: 13px; color: #666;"><strong>Your Customized Tour Package Price:</strong></p>
                  <p style="margin: 4px 0; font-size: 18px; font-weight: bold; color: #059669;">${getCurrencyType()} ${Number(totalAmount || 0).toLocaleString()}</p>
                </div>
                ` : ''}

                <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 12px 0;">

                <div style="background-color: white; padding: 12px; border-radius: 6px;">
                  <p style="margin: 8px 0; font-size: 14px;"><strong>📍 Tour Package Includes ${totalGuests} Guest(s)</strong></p>
                  <table style="width: 100%; font-size: 14px; margin-top: 10px;">
                    <tr>
                      <td><strong>Total Tour Package Cost:</strong></td>
                      <td style="text-align: right;"><strong style="font-size: 16px; color: #0f766e;">${getCurrencyType()} ${Number(booking.totalAmount || 0).toLocaleString()}</strong></td>
                    </tr>
                  </table>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">

                  <p style="margin: 6px 0; font-size: 13px;"><strong>📌 Advance Payment (50%):</strong> <span style="color: #059669; font-weight: bold; font-size: 15px;">${getCurrencyType()} ${Number(booking.depositAmount || 0).toLocaleString()}</span></p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>📌 Remaining (50%, Due Later):</strong> <span style="font-weight: bold;">${getCurrencyType()} ${Number(booking.remainingAmount || 0).toLocaleString()}</span></p>
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
                  <strong>✓ Your refund of ${getCurrencyType()} ${Number(booking.refundAmount).toLocaleString()} will be processed within 5-7 business days.</strong>
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

/**
 * Send customer special personal request to management
 * @param {Object} customer - Customer/guest object
 * @param {Object} booking - Reservation/Booking object
 * @param {string} personalRequest - Request text
 * @param {string} checkInDate - Check-in Date
 */
export const sendPersonalRequestEmail = async (customer, booking, personalRequest, checkInDate) => {
  try {
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : "Unknown Guest";
    const customerEmail = customer ? customer.email : "N/A";
    const customerPhone = customer ? customer.phoneNumber : "N/A";

    let checkIn = checkInDate;
    if (!checkIn || isNaN(new Date(checkIn).getTime())) {
      if (booking.bookedRooms && booking.bookedRooms.length > 0) {
        checkIn = booking.bookedRooms[0].checkIn;
      } else {
        const bookedRoom = await BookedRoom.findOne({ where: { booking_id: booking.id } });
        if (bookedRoom) {
          checkIn = bookedRoom.checkIn;
        }
      }
    }

    const subject = `Special Personal Request from ${customerName} (Booking #${booking.id})`;

    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #064e3b, #0f766e); color: #ffffff; padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
            .header p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
            .body { padding: 24px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0f766e; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
            .card { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .label { color: #6b7280; font-weight: 550; }
            .value { font-weight: 600; color: #1e293b; }
            .request-box { border-left: 4px solid #064e3b; background: #f0fdf4; border-radius: 0 8px 8px 0; padding: 16px; margin-top: 12px; }
            .request-text { color: #064e3b; line-height: 1.6; font-style: italic; margin: 0; font-size: 14px; }
            .footer { padding: 20px 24px; background: #f8fafc; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Special Personal Request</h1>
              <p>BlueBird Hotels Reservation System</p>
            </div>

            <div class="body">
              <div class="section">
                <div class="section-title">Customer Information</div>
                <div class="card" style="padding: 8px 16px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left; width: 40%;">Name</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;">${customerName}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left;">Email Address</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;"><a href="mailto:${customerEmail}" style="color: #0f766e; text-decoration: none;">${customerEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left;">Phone Number</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;">${customerPhone}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Booking Details</div>
                <div class="card" style="padding: 8px 16px;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left; width: 45%;">Booking Reference ID</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;">#${booking.id}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left;">Total Amount Price</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;">$${parseFloat(booking.total_price || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 550; text-align: left;">Check-in Date</td>
                      <td style="padding: 10px 0; font-weight: 600; color: #1e293b; text-align: right;">${checkIn ? new Date(checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Customer Request Message</div>
                <div class="request-box">
                  <p class="request-text">"${personalRequest}"</p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated request notification sent from your hotel reservation platform.</p>
              <p>&copy; ${new Date().getFullYear()} BlueBird Hotels. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.PERSONAL_REQUEST_MAIL,
      subject,
      html: emailBody,
      text: `Personal Request from ${customerName} (Booking #${booking.id}): ${personalRequest}`,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send personal request email:", error.message);
    return false;
  }
};

/**
 * Sends a notification email about a customer contact inquiry to the hotel admin.
 *
 * @param {object} params
 * @param {string} params.name - Customer's name
 * @param {string} params.email - Customer's email
 * @param {string} params.message - Customer's message
 */
export const sendInquiryEmail = async ({ name, email, message }) => {
  try {
    const subject = `New Contact Inquiry from ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">New Contact Message Received</h2>
        <p>A visitor has submitted a new inquiry message through the Contact Us form:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px; border-bottom: 1px solid #f0f0f0;">Sender Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Sender Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0369a1; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #555;">Message Content:</h4>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="margin-top: 25px; font-size: 11px; color: #888; border-top: 1px solid #e0e0e0; padding-top: 15px;">
          This email was generated automatically by the Blue Bird Hotels &amp; Tours portal contact system.
        </p>
      </div>
    `;

    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      subject,
      html,
      text: `New Contact Inquiry from ${name}\n\nEmail: ${email}\n\nMessage:\n${message}`,
      fromName: "Customer Inquiry (Hotel BlueBird)"
    });
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send contact inquiry email:", error.message);
    return false;
  }
};
