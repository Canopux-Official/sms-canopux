// import dotenv from 'dotenv';
// import express from 'express';
// import cors from 'cors';
// import compression from 'compression';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';

// dotenv.config();

// import connectDB from './config/db';
// import authRoutes from './routes/auth/auth';
// import adminStudentRoutes from './routes/admin/admin.student';
// import adminStreamRoutes from './routes/admin/admin.stream';
// import adminTargetExamRoutes from './routes/admin/admin.targetExam';
// import adminSubjectRoutes from './routes/admin/admin.subject';
// import materialRoutes from './routes/admin/admin.materialRoutes';
// import studentMaterialRoutes from './routes/student/studentMaterialRoutes';
// import studentProfileRoutes from './routes/student/studentProfileRoutes';
// import adminNoticeRoutes from './routes/admin/admin.noticeRoutes';
// import studentNoticeRoutes from './routes/student/studentNoticeRoutes';
// import adminDashboardRoutes from './routes/admin/admin.dashboardRoutes';
// import adminAttendanceRoutes from './routes/admin/admin.attendanceRoutes';
// import adminControlRoutes from './routes/admin/admin.controlRoutes';
// import studentAttendanceRoutes from './routes/student/student.attendanceRoutes';
// import cronRoutes from './routes/cronRoutes';
// import adminLandingPageRoutes from './routes/admin/admin.landingPageRoutes';
// import landingPageController from './controllers/landingPageController';

// const port = process.env.PORT || 3000;
// const app = express();



// app.use(helmet());

// app.use(compression());

// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { error: "Too many requests, please try again later." }
// });

// app.use(apiLimiter);

// app.use(cors({ origin: process.env.CLIENT_LINK }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Ensure DB is connected before any route handler runs.
// // connectDB() is idempotent — it returns the cached connection after the first call.
// // app.use(async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
// //   try {
// //     await connectDB();
// //     next();
// //   } catch (err) {
// //     console.error('DB connection failed:', err);
// //     res.status(503).json({ success: false, message: 'Database unavailable. Please try again.' });
// //   }
// // });

// const startServer = async () => {
//   try {
//     await connectDB(); // Wait for DB to be ready
//     console.log('Database connected. Starting server...');

//     if (process.env.VERCEL !== "true") {
//       app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//       });
//     }
//   } catch (err) {
//     console.error('Failed to connect to database:', err);
//     process.exit(1); // stop server if DB fails
//   }
// };

// startServer();


// // here change 
// // connectDB()
// //   .then(() => console.log("Database connected successfully"))
// //   .catch((err) => console.error("Database connection failed:", err));




// // Landing page public route
// app.get('/landingPage', (req: express.Request, res: express.Response) => {
//   landingPageController.getLandingPage(req, res);
// });

// app.use('/auth', authRoutes);

// // Admin routes
// app.use('/admin/dashboard', adminDashboardRoutes);
// app.use('/admin/studentControl', adminStudentRoutes);
// app.use('/admin/streamControl', adminStreamRoutes);
// app.use('/admin/targetExamControl', adminTargetExamRoutes);
// app.use('/admin/subjectControl', adminSubjectRoutes);
// app.use('/admin/material', materialRoutes);
// app.use('/admin/notice', adminNoticeRoutes);
// app.use('/admin/attendance', adminAttendanceRoutes);
// app.use('/admin/control', adminControlRoutes);
// app.use('/admin/landingPage', adminLandingPageRoutes);

// // Student routes
// app.use('/student/studentProfile', studentProfileRoutes);
// app.use('/student/material', studentMaterialRoutes);
// app.use('/student/notice', studentNoticeRoutes);
// app.use('/student/attendance', studentAttendanceRoutes);

// app.use('/api/cron', cronRoutes);

// // const startServer = () => { app.listen(port, () => { console.log(Server is running on port ${port}); }); }; if (process.env.VERCEL !== "true") { startServer(); }

// // here change 


// export default app;


import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';

// --- Route imports ---
import authRoutes from './routes/auth/auth';
import adminStudentRoutes from './routes/admin/admin.student';
import adminStreamRoutes from './routes/admin/admin.stream';
import adminTargetExamRoutes from './routes/admin/admin.targetExam';
import adminSubjectRoutes from './routes/admin/admin.subject';
import materialRoutes from './routes/admin/admin.materialRoutes';
import studentMaterialRoutes from './routes/student/studentMaterialRoutes';
import studentProfileRoutes from './routes/student/studentProfileRoutes';
import adminNoticeRoutes from './routes/admin/admin.noticeRoutes';
import studentNoticeRoutes from './routes/student/studentNoticeRoutes';
import adminDashboardRoutes from './routes/admin/admin.dashboardRoutes';
import adminAttendanceRoutes from './routes/admin/admin.attendanceRoutes';
import adminControlRoutes from './routes/admin/admin.controlRoutes';
import studentAttendanceRoutes from './routes/student/student.attendanceRoutes';
import cronRoutes from './routes/cronRoutes';
import adminLandingPageRoutes from './routes/admin/admin.landingPageRoutes';
import landingPageController from './controllers/landingPageController';

// -----------------------------------------------------------------------
// App setup
// -----------------------------------------------------------------------
const app = express();

app.set('trust proxy', 1); // Required for rate-limiter behind Vercel's proxy

app.use(helmet());
app.use(compression());

// CORS — tighten origin to your actual frontend URL
app.use(
  cors({
    origin: process.env.CLIENT_LINK,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
  })
);

// -----------------------------------------------------------------------
// DB middleware — runs before EVERY route.
// connectDB() is idempotent: it returns the cached connection if healthy.
// This is the correct pattern for Vercel serverless.
// -----------------------------------------------------------------------
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[App] DB unavailable:', err);
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please retry in a moment.',
    });
  }
});

// -----------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------
app.get('/landingPage', (req: Request, res: Response) => {
  landingPageController.getLandingPage(req, res);
});

app.use('/auth', authRoutes);

// Admin
app.use('/admin/dashboard', adminDashboardRoutes);
app.use('/admin/studentControl', adminStudentRoutes);
app.use('/admin/streamControl', adminStreamRoutes);
app.use('/admin/targetExamControl', adminTargetExamRoutes);
app.use('/admin/subjectControl', adminSubjectRoutes);
app.use('/admin/material', materialRoutes);
app.use('/admin/notice', adminNoticeRoutes);
app.use('/admin/attendance', adminAttendanceRoutes);
app.use('/admin/control', adminControlRoutes);
app.use('/admin/landingPage', adminLandingPageRoutes);

// Student
app.use('/student/studentProfile', studentProfileRoutes);
app.use('/student/material', studentMaterialRoutes);
app.use('/student/notice', studentNoticeRoutes);
app.use('/student/attendance', studentAttendanceRoutes);

// Cron
app.use('/api/cron', cronRoutes);

// -----------------------------------------------------------------------
// Global error handler
// -----------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// -----------------------------------------------------------------------
// Local dev only — Vercel runs the exported app directly, not via listen()
// -----------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`[App] Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('[App] Failed to start server:', err);
      process.exit(1);
    });
}

export default app;