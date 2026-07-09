import express from 'express';
import cors from 'cors';
import path from 'path';
import { corsOptions } from './config/cors.js';
import { env } from './config/environment.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import registrationRoutes from './modules/registration/registration.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import dashboardRoutes from './modules/admin-dashboard/dashboard.routes.js';
import userRoutes from './modules/users/user.routes.js';
import banRoutes from './modules/bans/ban.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import announcementRoutes from './modules/announcements/announcement.routes.js';
import verificationAdminRoutes from './modules/verification/verification.routes.js';
import complaintRoutes from './modules/complaints/complaint.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import clientRoutes from './modules/clients/client.routes.js';
import { providerRouter, providerPublicRouter } from './modules/providers/provider.routes.js';
import referenceRoutes from './modules/reference/reference.routes.js';
import { clientBookingRouter, providerBookingRouter } from './modules/bookings/booking.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import paymentSettingsRoutes from './modules/payment-settings/paymentSettings.routes.js';
import membershipRoutes from './modules/memberships/membership.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import invoiceRoutes from './modules/invoices/invoice.routes.js';
import { Router } from 'express';
import { authenticate } from './middleware/authenticate.js';
import { requireSystemAdmin } from './middleware/requireSystemAdmin.js';
import { listBookingsHandler } from './modules/bookings/adminBooking.controller.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/public', express.static(path.resolve(env.publicStoragePath)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const adminBookingRoutes = Router();
adminBookingRoutes.use(authenticate, requireSystemAdmin);
adminBookingRoutes.get('/', listBookingsHandler);

app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/provider', providerRouter);
app.use('/api/provider', providerBookingRouter);
app.use('/api/provider', availabilityRoutes);
app.use('/api/provider/invoices', invoiceRoutes);
app.use('/api/providers', providerPublicRouter);
app.use('/api/bookings', clientBookingRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/system-admin/dashboard', dashboardRoutes);
app.use('/api/system-admin/bookings', adminBookingRoutes);
app.use('/api/system-admin/users', userRoutes);
app.use('/api/system-admin/bans', banRoutes);
app.use('/api/system-admin/reports', reportRoutes);

app.use('/api/verification-admin/verification', verificationAdminRoutes);
app.use('/api/verification-admin/complaints', complaintRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
