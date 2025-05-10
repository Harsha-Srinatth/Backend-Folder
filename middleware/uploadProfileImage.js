
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
}).single('profilePhoto');

// Export middleware and handler separately for cleaner usage in routes
exports.uploadProfileImage = (req,res,next) => {
    upload(req , res , function(err){
        if(err instanceof multer.MulterError){
            console.log("Multer error:",err);
            return res.status(400).json({message: `upload error: ${err.message}`})
        }else if (err){
            console.log("unknown upload error",err);
            return res.status(400).json({message:err.message});
        }
        next();
    });
}
