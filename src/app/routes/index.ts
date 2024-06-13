import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { RoomsRoutes } from '../modules/Room/room.route';
import { SlotRoutes } from '../modules/Slot/slot.route';
import { BookingRoutes } from '../modules/Booking/booking.route';

const router = Router();

const moduleRoutes = [
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
    path: '/bookings ',
    route: BookingRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
