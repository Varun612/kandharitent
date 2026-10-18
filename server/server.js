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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    business: 'Kandhari Tent & Caterers & Dwarka Shri Lawn, Lucknow',
    database: isMongoConnected() ? 'MongoDB' : 'Resilient LocalStore (JSON)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/venue', venueRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

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

// Only listen when executed directly in non-serverless environment
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'test') {
  startServer();
} else {
  // In serverless environments (e.g. Vercel), connect database asynchronously
  connectDB().catch(err => console.error('Serverless DB Connect Error:', err));
}

module.exports = app;
