import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { TechnicianRoutes } from '../modules/technician/technician.routes';
// import { ServiceRoutes } from '../modules/service/service.routes';
// import { BookingRoutes } from '../modules/booking/booking.routes';
// import { PaymentRoutes } from '../modules/payment/payment.routes';
// import { ReviewRoutes } from '../modules/review/review.routes';
// import { AdminRoutes } from '../modules/admin/admin.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/', route: TechnicianRoutes }, // exposes /technicians and /technician/* itself
//   { path: '/services', route: ServiceRoutes },
//   { path: '/bookings', route: BookingRoutes },
//   { path: '/payments', route: PaymentRoutes },
//   { path: '/reviews', route: ReviewRoutes },
//   { path: '/admin', route: AdminRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
