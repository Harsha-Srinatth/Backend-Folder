const Details = require('../models/Details');
const multer = require('multer');

// Set up multer storage for file uploads
const storage = multer.memoryStorage(); // Store as buffer in memory

// Set up file filter
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only images'), false);
  }
};

// Configure multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (generous buffer)
  fileFilter: fileFilter
});

// Export middleware and handler separately for cleaner usage in routes
exports.uploadProfileImage = upload.single('profileImage');
