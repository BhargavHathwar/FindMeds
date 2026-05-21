// middleware/uploadMiddleware.js
// Handles photo proof uploads → Cloudinary.
// Used in the donation listing route for strip photos.

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import '../config/cloudinary.js';

// Store file in memory first, then stream to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// Upload buffer to Cloudinary and return secure URL
export const uploadToCloudinary = (buffer, folder = 'findmeds/donations') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};
