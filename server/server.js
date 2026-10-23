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
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const staffRoutes = require('./routes/staffRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const masterAgentRoutes = require('./routes/masterAgentRoutes');
const threeAgentRoutes = require('./routes/threeAgentRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes');
const { authLimiter, enquiryLimiter, chatLimiter, receptionistLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5050;

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

// Rate Limiting on sensitive surfaces
app.use(['/api/auth', '/auth'], authLimiter);
app.use(['/api/enquiries', '/enquiries'], enquiryLimiter);
app.use(['/api/chat', '/chat'], chatLimiter);
app.use(['/api/receptionist', '/receptionist'], receptionistLimiter);

// API Routes
mountDualRoute('/items', itemRoutes);
mountDualRoute('/enquiries', enquiryRoutes);
mountDualRoute('/venue', venueRoutes);
mountDualRoute('/gallery', galleryRoutes);
mountDualRoute('/auth', authRoutes);
mountDualRoute('/chat', chatRoutes);
mountDualRoute('/catering', cateringRoutes);
mountDualRoute('/payments', paymentRoutes);
mountDualRoute('/notifications', notificationRoutes);
mountDualRoute('/reports', reportRoutes);
mountDualRoute('/inventory', inventoryRoutes);
mountDualRoute('/staff', staffRoutes);
mountDualRoute('/analytics', analyticsRoutes);
mountDualRoute('/agent', masterAgentRoutes);
mountDualRoute('/agents', threeAgentRoutes);
mountDualRoute('/marketing', marketingRoutes);
mountDualRoute('/invoices', invoiceRoutes);
mountDualRoute('/receptionist', receptionistRoutes);
mountDualRoute('/settings', settingsRoutes);
mountDualRoute('/coupons', couponRoutes);
mountDualRoute('/delivery-partners', deliveryPartnerRoutes);

// Static media serving for lawn videos, reels, and rendered assets
app.use('/media', express.static(path.join(__dirname, '../client/public/media')));
app.use('/media/rendered_reels', express.static(path.join(__dirname, '../client/public/media/rendered_reels')));

// Serve static client build and SPA routing if dist exists
const fs = require('fs');
const distPath = path.join(__dirname, '../dist');
const clientDistPath = path.join(__dirname, '../client/dist');
const staticPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(clientDistPath) ? clientDistPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
  
  // SPA Fallback for client routes
  app.get('*', (req, res, next) => {
    const p = req.path || '';
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    // If browser request for HTML, always serve the SPA unless requesting /api
    if (acceptsHtml && !p.startsWith('/api')) {
      return res.sendFile(path.join(staticPath, 'index.html'));
    }

    if (p.startsWith('/api') || p.startsWith('/items') || p.startsWith('/enquiries') || p.startsWith('/health') || p.startsWith('/catering/menu') || p.startsWith('/catering/packages') || p.startsWith('/catering/enquiries')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

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
