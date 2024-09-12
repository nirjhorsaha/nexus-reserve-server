import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { RoomsRoutes } from '../modules/Room/room.route';
import { SlotRoutes } from '../modules/Slot/slot.route';
import { BookingRoutes } from '../modules/Booking/booking.route';
import { UserRoutes } from '../modules/User/user.route';
import { PaymentRoutes } from '../modules/Payment/payments.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/rooms',
    route: RoomsRoutes,
  },
  {
    path: '/slots',
    route: SlotRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/payment',
    route: PaymentRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
