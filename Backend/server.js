// server.js — FindMeds Backend
// Member 2 | MongoDB Atlas + JWT + Socket.io
// Entry point — wires Express, Socket.io, DB, routes, cron.

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { startCronJobs } from './config/cronJobs.js';

import authRoutes from './routes/authRoutes.js';
import barcodeRoutes from './routes/barcodeRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const httpServer = createServer(app); // Socket.io needs a raw HTTP server
const PORT = process.env.PORT || 5001;

// ── Socket.io setup ──────────────────────────────────────────────────────────
// Global io so controllers can emit events (e.g. donation_claimed)
global.io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://findmeds.vercel.app',
    ],
    methods: ['GET', 'POST'],
  },
});

global.io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // NGO joins their room to receive targeted notifications
  socket.on('join_ngo_room', (ngoId) => {
    socket.join(`ngo_${ngoId}`);
    console.log(`[Socket.io] NGO ${ngoId} joined their room`);
  });

  // Donor joins their room for real-time donation status updates
  socket.on('join_donor_room', (donorId) => {
    socket.join(`donor_${donorId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://findmeds.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'FindMeds API is running',
    database: 'MongoDB Atlas',
    auth: 'JWT',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB(); // Connect MongoDB first, then start listening
  httpServer.listen(PORT, () => {
    console.log(`\n✅ FindMeds Backend running on http://localhost:${PORT}`);
    console.log(`📦 Database: MongoDB Atlas`);
    console.log(`🔐 Auth: Custom JWT`);
    console.log(`🔌 Socket.io: enabled`);
    console.log(`🔗 Health: http://localhost:${PORT}/health\n`);
    startCronJobs();
  });
};

start();

export default app;
