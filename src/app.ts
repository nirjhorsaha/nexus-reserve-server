import express, { Request, Response } from 'express';
// import notFound from './app/middlewares/notFound';
// import router from './app/routes';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

// application routes
// app.use('/api/v1', router);

// root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our Co-Working Space Booking System!');
});

//Not Found
// app.use(notFound);

export default app;
