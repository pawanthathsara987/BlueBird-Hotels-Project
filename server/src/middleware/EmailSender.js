import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendInquiryReceivedEmail = async (inquiry) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: inquiry.email,
      subject: `Tour Inquiry Received - ${inquiry.inquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Hi ${inquiry.fullName},</h2>
          
          <p>Thank you for submitting your tour inquiry! We've received your request and our team will review it shortly.</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Inquiry Details</h3>
            <p><strong>Reference:</strong> ${inquiry.inquiryRef}</p>
            <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${inquiry.numberOfAdults} adults${inquiry.numberOfChildren > 0 ? `, ${inquiry.numberOfChildren} children` : ""}</p>
            <p><strong>Pickup Location:</strong> ${inquiry.pickupLocation}</p>
          </div>
          
          <p>We'll get back to you within 24 hours with confirmation and payment details.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Inquiry received email sent to:", inquiry.email);
  } catch (error) {
    console.error("Error sending inquiry received email:", error);
    throw error;
  }
};

export const sendInquiryAcceptedEmail = async (inquiry, booking) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const paymentLink = `${baseUrl}/payment?bookingId=${booking.id}&token=${booking.paymentToken}`;
    const trackingLink = `${baseUrl}/track?bookingId=${booking.id}&token=${booking.trackingToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: inquiry.email,
      subject: `Booking Confirmed - ${booking.bookingRef} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Hi ${inquiry.fullName}, Your Booking is Confirmed! 🎉</h2>
          
          <hr style="border: none; border-top: 2px solid #16a34a; margin: 20px 0;">
          
          <h3 style="color: #1e40af;">Booking Details</h3>
          <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p><strong>Booking Ref:</strong> ${booking.bookingRef}</p>
            <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${inquiry.numberOfAdults} adults${inquiry.numberOfChildren > 0 ? `, ${inquiry.numberOfChildren} children` : ""}</p>
            <p><strong>Pickup Location:</strong> ${inquiry.pickupLocation}</p>
          </div>
          
          <h3 style="color: #1e40af;">Pricing</h3>
          <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p><strong>Total Amount:</strong> LKR ${Number(booking.totalAmount).toFixed(2)}</p>
            <p style="color: #dc2626; font-size: 16px;"><strong>Deposit (50%):</strong> LKR ${Number(booking.depositAmount).toFixed(2)}</p>
            <p><strong>Remaining (50%):</strong> LKR ${Number(booking.remainingAmount).toFixed(2)}</p>
          </div>
          
          <h3 style="color: #1e40af;">Next Steps</h3>
          <p><strong>Please pay your deposit within 48 hours to confirm your booking.</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              💳 Pay Deposit Now
            </a>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${trackingLink}"
               style="background-color: #16a34a; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📍 Track Your Booking
            </a>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 30px 0;">
            <p style="color: #991b1b; font-weight: bold;">⚠️ Important</p>
            <p style="color: #7f1d1d; margin: 10px 0;">
              Payment link expires in <strong>48 hours</strong>. After that, your booking may be cancelled.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            If you have any questions or need to reschedule, please contact us immediately.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Inquiry accepted email sent to:", inquiry.email);
  } catch (error) {
    console.error("Error sending inquiry accepted email:", error);
    throw error;
  }
};

export const sendInquiryRejectedEmail = async (inquiry) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: inquiry.email,
      subject: `Tour Inquiry Update - ${inquiry.inquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Hi ${inquiry.fullName},</h2>
          
          <p>Thank you for your interest in our tours. Unfortunately, we are unable to confirm your booking at this time.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">Reason for Rejection</h3>
            <p style="color: #7f1d1d;">${inquiry.managerNote || "Not available for selected dates"}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Your Inquiry Details</h3>
            <p><strong>Reference:</strong> ${inquiry.inquiryRef}</p>
            <p><strong>Tour Date:</strong> ${new Date(inquiry.startDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${inquiry.numberOfAdults} adults${inquiry.numberOfChildren > 0 ? `, ${inquiry.numberOfChildren} children` : ""}</p>
          </div>
          
          <p><strong>What you can do:</strong></p>
          <ul style="color: #4b5563;">
            <li>Try booking for different dates</li>
            <li>Contact us for alternative tour options</li>
            <li>Explore our other available tours</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            We appreciate your interest and hope to see you soon for another tour!
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Inquiry rejected email sent to:", inquiry.email);
  } catch (error) {
    console.error("Error sending inquiry rejected email:", error);
    throw error;
  }
};