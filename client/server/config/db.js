/**
 * Database & Persistence Management
 * Supports both MongoDB (via Mongoose) and resilient Local JSON Store fallback.
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const seedData = require('../seed/seedData');

let isMongoConnected = false;
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;
const dataDir = isServerless ? path.join('/tmp', 'kandhari-data') : path.join(__dirname, '../data');
const storeFilePath = path.join(dataDir, 'localStore.json');
const bundledSeedPath = path.join(__dirname, '../data/localStore.json');

// Ensure local data store directory exists safely
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  // If filesystem is read-only, continue safely in-memory
  console.warn('[LocalStore] Operating in-memory mode:', e.message);
}

// In-Memory & Local JSON Store
let localDb = {
  items: [...seedData.sampleItems],
  categories: [...seedData.categories],
  venue: { ...seedData.venueDetails },
  gallery: [...seedData.galleryItems],
  enquiries: [...seedData.sampleEnquiries],
  conversations: [],
  users: [],
  adminUsers: [
    {
      id: 'admin-1',
      username: process.env.ADMIN_USERNAME || 'admin',
      // default bcrypt hash for 'admin@kandhari2026'
      passwordHash: '$2a$10$wTqJ149eA/3v5yAODkF6.e6k1.t0Y.2cceS94j.rRk8c/c45uLwIe',
      role: 'admin'
    }
  ]
};

// Initialize or load from localStore.json if it exists
const loadLocalStore = () => {
  try {
    let content = null;
    if (fs.existsSync(storeFilePath)) {
      content = fs.readFileSync(storeFilePath, 'utf8');
    } else if (fs.existsSync(bundledSeedPath)) {
      content = fs.readFileSync(bundledSeedPath, 'utf8');
    }

    if (content) {
      const parsed = JSON.parse(content);
      if (parsed && parsed.items && parsed.items.length > 0) {
        localDb = parsed;
        if (!localDb.conversations) localDb.conversations = [];
        if (!localDb.users) localDb.users = [];
        // Ensure gallery exists
        if (!localDb.gallery || localDb.gallery.length === 0) {
          localDb.gallery = [...seedData.galleryItems];
        }
        console.log('[LocalStore] Loaded persistent data successfully');
        return;
      }
    }
    // Save initial seed to file if writable
    saveLocalStore();
  } catch (err) {
    console.warn('[LocalStore] Could not read localStore.json, using defaults:', err.message);
  }
};

// Immediately initialize localDb from localStore.json
loadLocalStore();

const saveLocalStore = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storeFilePath, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.warn('[LocalStore] Warning saving store (in-memory remains current):', err.message);
  }
};

// Connect to MongoDB with graceful fallback
const connectDB = async () => {
  if (isMongoConnected) return;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kandhari_tent';
  
  loadLocalStore();

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500 // Don't hang if Mongo isn't running locally
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[Database] MongoDB not available (${error.message}). Using resilient Local JSON Store.`);
    console.log(`[Database] Full CRUD operations for items, enquiries, venue, and gallery are active.`);
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getLocalDb: () => localDb,
  saveLocalStore
};
