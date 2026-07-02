import adminRouter from './routes/adminRouter.js'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bookingRouter from './routes/bookingRouter.js';
import userRouter from './routes/userRoutes.js';
import managerRouter from './routes/managerRouter.js';
import tourInquiryRouter from './routes/tourInquiryRouter.js';
import receptionRouter from './routes/receptionRouter.js';
import chatBot from './controllers/chatController.js';
import customerRouter from './routes/customerRoutes.js';
import vehicleRouter from './routes/vehicleRouter.js';
import vehicleTypeRouter from './routes/vehicleTypeRouter.js';
import paymentRouter from './routes/paymentRouter.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://booking.bluebirdhotels.lk",
    "https://admin.bluebirdhotels.lk",
    "https://manager.bluebirdhotels.lk",
    "https://reception.bluebirdhotels.lk",
    "https://auth.bluebirdhotels.lk",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
        const isBluebirdSubdomain = origin.endsWith(".bluebirdhotels.lk") || origin === "https://bluebirdhotels.lk" || origin === "http://bluebirdhotels.lk";
        const isConfigured = process.env.CLIENT_URL && origin === process.env.CLIENT_URL;

        if (isLocalhost || isBluebirdSubdomain || isConfigured || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/roombook', bookingRouter);
app.use('/api/tour-inquiry', tourInquiryRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/manager', managerRouter);
app.use('/api/reception', receptionRouter);
app.use('/api/customers', customerRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/vehicle-types', vehicleTypeRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
// Vehicle service logs: nested under vehicles and standalone for log operations
// Vehicle service logs removed
app.post('/api/chat', chatBot);

export default app;