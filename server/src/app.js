import express from 'express';
import cors from 'cors';
import bookingRouter from './routes/bookingRouter.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', bookingRouter);  

export default app;