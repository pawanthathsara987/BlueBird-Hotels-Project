import express from 'express';
import {
  createTourInquiry,
  getAllInquiries,
  getInquiryById,
  acceptInquiry,
  sendAcceptedInquiryEmail,
  rejectInquiry,
  getInquiriesByTour,
  getInquiryStats,
} from '../controllers/booking/tourInquiryController.js';

const router = express.Router();

// Create inquiry (customer submits booking form)
router.post('/', createTourInquiry);

// Get all inquiries (manager/admin)
router.get('/', getAllInquiries);

// Get inquiry stats
router.get('/stats', getInquiryStats);

// Get inquiries for specific tour
router.get('/tour/:tourId', getInquiriesByTour);

// Get inquiry by ID
router.get('/:id', getInquiryById);

// Accept inquiry (manager accepts and creates booking)
router.put('/:id/accept', acceptInquiry);

// Send accepted inquiry quote email (manager customizes quote and sends to guest)
router.put('/:id/send-accepted-email', sendAcceptedInquiryEmail);

// Reject inquiry (manager rejects)
router.put('/:id/reject', rejectInquiry);

export default router;
