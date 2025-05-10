const Details = require('../models/Details');
const sharp = require('sharp');


exports.uploadProfileImg = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("received user id for Upload Profile photo", userId);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Process image with sharp to ensure it's optimized
    // Even if client already compressed, this ensures uniformity
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize({ 
        width: 400,           // Standard profile pic width
        height: 400,          // Square crop for profile pic
        fit: 'cover',         // Preserve aspect ratio & cover area
        position: 'center'    // Center focus for crop
      })
      .jpeg({ quality: 80 })  // Convert to JPEG with reasonable quality
      .toBuffer();
    const sizeInMB = ( processedImageBuffer.length / ( 1024 *1024)).toFixed(4);
    console.log(`Compressed image size: ${sizeInMB} MB`);
    // Update user record
    const user = await Details.findByIdAndUpdate(
      userId,
      {
        image: {
          data: processedImageBuffer,
          contentType: 'image/jpeg' // We converted to JPEG
        }
      },
      { new: true, runValidators: false }
    );
    
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
