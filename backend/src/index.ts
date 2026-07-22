import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminDoctorRoutes from './routes/adminDoctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import patientDoctorRoutes from './routes/patientDoctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';
import adminMedicalRecordRoutes from './routes/adminMedicalRecordRoutes.js';
import adminBillRoutes from './routes/adminBillRoutes.js';
import patientBillRoutes from './routes/patientBillRoutes.js';
import doctorBillRoutes from './routes/doctorBillRoutes.js';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js';
import doctorAnalyticsRoutes from './routes/doctorAnalyticsRoutes.js';
import patientAnalyticsRoutes from './routes/patientAnalyticsRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import fileUploadRoutes from './routes/fileUploadRoutes.js';
import adminFileRoutes from './routes/adminFileRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { createServer } from 'http';
import { initSocketServer } from './services/socketService.js';
import { logger } from './utils/logger.js';

const app = express();
const httpServer = createServer(app);
initSocketServer(httpServer);

// CORS Middleware (Must be registered before routes and security headers)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.NODE_ENV === 'production') {
        const allowedOrigins = [
          env.CORS_ORIGIN,
          env.FRONTEND_URL,
          'https://ready-nest-internship-week-6.vercel.app',
          'https://ready-nest-intership-week-6.vercel.app',
          'https://smart-hospital-management.vercel.app',
        ].map(url => url?.replace(/\/+$/, ''));
        
        if (allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
          return callback(null, true);
        } else {
          return callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      }
      callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  })
);

// Logging and Request Parsing
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

app.use('/api', limiter);

// Routes (Mounted with and without /api prefix for production URL compatibility)
app.use('/api', healthRoutes);
app.use('/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/admin/doctors', adminDoctorRoutes);
app.use('/admin/doctors', adminDoctorRoutes);

app.use('/api/patient', patientRoutes);
app.use('/patient', patientRoutes);

app.use('/api/doctors', patientDoctorRoutes);
app.use('/doctors', patientDoctorRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/appointments', appointmentRoutes);

app.use('/api/doctor', doctorRoutes);
app.use('/doctor', doctorRoutes);

app.use('/api/prescriptions', prescriptionRoutes);
app.use('/prescriptions', prescriptionRoutes);

app.use('/api/medical-records', medicalRecordRoutes);
app.use('/medical-records', medicalRecordRoutes);

app.use('/api/admin/medical-records', adminMedicalRecordRoutes);
app.use('/admin/medical-records', adminMedicalRecordRoutes);

app.use('/api/admin/bills', adminBillRoutes);
app.use('/admin/bills', adminBillRoutes);

app.use('/api/patient/bills', patientBillRoutes);
app.use('/patient/bills', patientBillRoutes);

app.use('/api/doctor/bills', doctorBillRoutes);
app.use('/doctor/bills', doctorBillRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/profile', profileRoutes);
app.use('/profile', profileRoutes);

app.use('/api/medical-records', fileUploadRoutes);
app.use('/api/admin/files', adminFileRoutes);
app.use('/admin/files', adminFileRoutes);

app.use('/api/admin', adminAnalyticsRoutes);
app.use('/admin', adminAnalyticsRoutes);

app.use('/api/doctor/dashboard', doctorAnalyticsRoutes);
app.use('/api/patient/dashboard', patientAnalyticsRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);

// JSON 404 Handler for unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

import { execSync } from 'child_process';

const PORT = env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server & Socket.IO running in ${env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  
  // Database synchronization is handled out-of-band via package.json scripts to prevent process hangs in watch mode
  logger.info('Database synchronization deferred (managed via package.json).');
});
