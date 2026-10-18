require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, isMongoConnected } = require('./config/db');

const itemRoutes = require('./routes/itemRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const venueRoutes = require('./routes/venueRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cateringRoutes = require('./routes/cateringRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Normalize req.url when Vercel serverless rewrites point to /api
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
  if (matchedPath && (req.url === '/api' || req.url === '/' || req.url.startsWith('/api?'))) {
    const queryIdx = req.url.indexOf('?');
    const queryPart = queryIdx !== -1 ? req.url.substring(queryIdx) : '';
    req.url = matchedPath + (matchedPath.includes('?') ? '' : queryPart);
  }
  next();
});

// Ensure database connection is ready for incoming requests in serverless environments
app.use(async (req, res, next) => {
  if (!isMongoConnected() && process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (e) {
      // Graceful fallback to localStore
    }
  }
  next();
});

// Health Check - supports both /api/health and /health
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    business: 'Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow',
    database: isMongoConnected() ? 'MongoDB' : 'Resilient LocalStore (JSON)',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root and /api entrypoint check
app.get(['/', '/api', '/api/'], (req, res) => {
  res.json({
    name: 'Kandhari Tent & Caterers API',
    status: 'online',
    business: 'Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow',
    endpoints: {
      items: '/api/items',
      venue: '/api/venue',
      enquiries: '/api/enquiries',
      gallery: '/api/gallery',
      health: '/api/health'
    }
  });
});

// Helper for dual mounting routes with and without /api prefix
// This ensures compatibility across direct serverless execution, Vercel rewrites, and custom reverse proxies
const mountDualRoute = (basePath, router) => {
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  app.use(`/api${cleanPath}`, router);
  app.use(cleanPath, router);
};

// API Routes
mountDualRoute('/items', itemRoutes);
mountDualRoute('/enquiries', enquiryRoutes);
mountDualRoute('/venue', venueRoutes);
mountDualRoute('/gallery', galleryRoutes);
mountDualRoute('/auth', authRoutes);
mountDualRoute('/chat', chatRoutes);
mountDualRoute('/catering', cateringRoutes);

// Catch-all 404 handler for API routes (always return JSON, never HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  KANDHARI TENT & CATERERS - BACKEND API SERVER    `);
    console.log(`  Associated Venue: Dwarka Shri Lawn, Lucknow      `);
    console.log(`  Listening on port: http://localhost:${PORT}        `);
    console.log(`====================================================`);
  });
};

// Only listen when executed directly via `node server.js` in non-serverless environment
if (require.main === module && process.env.VERCEL !== '1' && !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'test') {
  startServer();
} else {
  // In serverless environments (e.g. Vercel) or when imported as a module, connect database asynchronously
  connectDB().catch(err => console.error('Serverless DB Connect Error:', err));
}

module.exports = app;
