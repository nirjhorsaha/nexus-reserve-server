import express, { Request, Response } from 'express';
import router from './app/routes';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://nexus-reserve.vercel.app'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router); // Application routes

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our Co-Working Space Booking System!');
});

app.use(globalErrorHandler); // Global error handling middlewares

app.use(notFound); // Not Found Route

export default app;
