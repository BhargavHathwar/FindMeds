// config/db.js
// Connects to MongoDB Atlas via Mongoose.
// Called once in server.js — connection is reused across all models.

import 'dotenv/config';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
    });
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // crash the server if DB is unreachable on startup
  }
};

export default connectDB;
