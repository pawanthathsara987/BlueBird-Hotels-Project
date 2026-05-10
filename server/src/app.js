import adminRouter from './routes/adminRouter.js'
import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/bookingRouter.js';
import userRouter from './routes/userRoutes.js';
import managerRouter from './routes/managerRouter.js';
import tourInquiryRouter from './routes/tourInquiryRouter.js';
import receptionRouter from './routes/receptionRouter.js';
import chatBot from './controllers/chatController.js';
import customerRouter from './routes/customerRoutes.js';
import vehicleRouter from './routes/vehicleRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/roombook', bookingRouter);
app.use('/api/tour-inquiry', tourInquiryRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/manager', managerRouter);
app.use('/api/reception', receptionRouter);
app.use('/api/customers', customerRouter);
app.use('/api/vehicles', vehicleRouter);
app.post('/api/chat', chatBot);

export default app;