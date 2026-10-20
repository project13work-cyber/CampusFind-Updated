const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

// 1. Load environment variables first
dotenv.config();

// 2. Initialize Express app FIRST before using 'app'
const app = express();

// Render (and most hosts) put a reverse proxy in front of the app. Without this every
// visitor looks like the same IP, so the rate limiter would lock everyone out together.
app.set('trust proxy', 1);

// 3. Connect to MongoDB, then make sure the admin from ADMIN_EMAIL / ADMIN_PASSWORD exists
connectDB().then(() => require('./services/adminBootstrap').ensureAdminFromEnv());

// 4. Middlewares & CORS Configuration
const allowedOrigins = [
  'https://campusfind-frontend-y4dc.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
];

// Any Render-hosted frontend (https://<name>.onrender.com). Login uses a Bearer token
// header (not cookies), so allowing these origins does not expose sessions.
const isRenderOrigin = (origin) => /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);

// In development accept any localhost port (Vite moves to 5174, 4173... if 5173 is busy).
const isLocalDevOrigin = (origin) =>
  process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as server-to-server requests.
    if (!origin || allowedOrigins.includes(origin) || isRenderOrigin(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    console.error(`[CORS] Blocked origin: ${origin}`);
    // Do not throw: a thrown error skips the CORS headers and the browser only shows "network error".
    return callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Local-disk uploads are wiped on every deploy/restart on hosts like Render.
if (process.env.NODE_ENV === 'production' && !require('./services/imageStorage').isCloudinaryConfigured()) {
  console.warn('[Uploads] Cloudinary is not configured: images are saved to local disk and WILL BE LOST on redeploy.');
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost', require('./routes/lostRoutes'));
app.use('/api/found', require('./routes/foundRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'CampusFind API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('CampusFind API is running. Access endpoints via /api/*');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[CampusFind Server Error]', err);
  if (res.headersSent) return next(err);

  let statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request is too large.';
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(' ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with these details already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[CampusFind] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

module.exports = { app, server };