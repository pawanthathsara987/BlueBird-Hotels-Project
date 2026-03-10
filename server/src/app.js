import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/bookingRouter.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRouter.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', bookingRouter); 
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

export default app;