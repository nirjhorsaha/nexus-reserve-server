import express, { Request, Response } from 'express';
import router from './app/routes';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app = express();

app.use(express.json());
app.use(cors());

// application routes
app.use('/api/v1', router);

// root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our Co-Working Space Booking System!');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
