
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Config and DB imports
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';

const app = express();

// Trust reverse proxy (Crucial for Render / Vercel to handle HTTPS and real client IP)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows loading files locally in frontend
  })
);

// CORS configuration
const frontendOrigins = [
  'https://campus-connect-pi-jade.vercel.app',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5174',
  'http://localhost:5174',
  'http://127.0.0.1:5175',
  'http://localhost:5175',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Check if origin is localhost, local network IP, or any Vercel domain
    const isLocal = 
      origin.startsWith('http://localhost') || 
      origin.startsWith('http://127.0.0.1') ||
      /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
      
    const isVercel = origin.endsWith('.vercel.app');
    const isWhitelisted = frontendOrigins.includes(origin);

    if (isLocal || isVercel || isWhitelisted) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting (General)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Resolve static paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to normalize duplicate /api/api paths from misconfigured clients
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

// Map Router Endpoints - Support both /api and /api/api prefixes
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/students`, studentRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/recruiters`, recruiterRoutes);
  app.use(`${prefix}/applications`, applicationRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/bookmarks`, bookmarkRoutes);
};

mountRoutes('/api');
mountRoutes('/api/api');

// Base route health check
app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'CampusConnect API is running smoothly' });
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

// Start accepting requests only after the database is ready.
const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup aborted because MongoDB is unavailable.');
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
