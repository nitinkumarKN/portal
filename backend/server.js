import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB from './config/db.js';
import fs from 'fs';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Uploads directory created');
}

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 Server Status:');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Base URL: http://localhost:${PORT}`);
  console.log(`✓ Uploads directory: ${uploadsDir}`);
  console.log('\n📍 Available Routes:');
  console.log(`  - http://localhost:${PORT}/api/auth`);
  console.log(`  - http://localhost:${PORT}/api/student`);
  console.log(`  - http://localhost:${PORT}/api/company`);
  console.log(`  - http://localhost:${PORT}/api/admin`);
  console.log('\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
