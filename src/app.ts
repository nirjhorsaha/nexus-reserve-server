import express, { Request, Response } from 'express';
import router from './app/routes';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';


const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
// app.use(cors());

// Application routes
app.use('/api', router);
// app.use(
//   '/api/my-bookings',
//   authenticateUser,
//   BookingController.getUserBookings,
// );

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our Co-Working Space Booking System!');
});

// Global error handling middlewares
app.use(globalErrorHandler);

// Not Found Route
app.use(notFound);

export default app;
