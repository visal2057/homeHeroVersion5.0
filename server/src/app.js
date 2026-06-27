import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import registrationRoutes from './modules/registration/registration.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
