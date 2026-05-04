import adminRouter from './routes/adminRouter.js'
import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/bookingRouter.js';
import userRouter from './routes/userRoutes.js';
import managerRouter from './routes/managerRouter.js';
import tourInquiryRouter from './routes/tourInquiryRouter.js';
import tourBookingRouter from './routes/tourBookingRouter.js';
import tourPaymentRouter from './routes/tourPaymentRouter.js';
import jwt from 'jsonwebtoken';
import chatBot from './controllers/chatController.js';
import customerRouter from './routes/customerRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/roombook', bookingRouter);
app.use('/api/tour-inquiry', tourInquiryRouter);
app.use('/api/tour-booking', tourBookingRouter);
app.use('/api/tour-payment', tourPaymentRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/manager', managerRouter);
app.use('/api/customers', customerRouter);
app.post('/api/chat', chatBot);

export default app;