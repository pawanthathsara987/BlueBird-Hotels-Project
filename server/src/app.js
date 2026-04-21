import adminRouter from './routes/adminRouter.js'
import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/bookingRouter.js';
import userRouter from './routes/userRoutes.js';
import managerRouter from './routes/managerRouter.js';
import tourInquiryRouter from './routes/tourInquiryRouter.js';
import tourBookingRouter from './routes/tourBookingRouter.js';
import tourPaymentRouter from './routes/tourPaymentRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', bookingRouter);
app.use('/api/tour-inquiry', tourInquiryRouter);
app.use('/api/tour-booking', tourBookingRouter);
app.use('/api/tour-payment', tourPaymentRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/manager', managerRouter);

export default app;