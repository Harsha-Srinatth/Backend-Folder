const Details  = require( '../models/Details.js'); 
const  Uploads = require("../models/Post-up.js");
const Comments = require("../models/comments.js");
const mongoose = require('mongoose');


exports.deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { userid } = req.params;
    const currentUserId = req.user.userId 
    
    // Check if user is deleting their own account or has admin privileges
    if (currentUserId !== userid) {
      return res.status(403).json({
        message: 'Unauthorized to delete this account' 
      });
    }

    await session.withTransaction(async () => {

      await Uploads.deleteMany({ userid: userid }, { session });
      
      // 2. Delete all comments by the user
      await Comments.deleteMany({ userid: userid }, { session });
      
      // 3. Remove user from all followers arrays
      await Details.updateMany(
        { followers: userid },
        { $pull: { followers: userid } },
        { session }
      );
      
      // 4. Remove user from all following arrays
      await Details.updateMany(
        { following: userid },
        { $pull: { following: userid } },
        { session }
      );
      
      // 5. Delete all comments on user's posts (if needed)
      const userPosts = await Uploads.find({ userid: userid }, { userid: 1 }, { session });
      const postIds = userPosts.map(post => post.postId);
      await Comments.deleteMany({ postId: { $in: postIds } }, { session });
      
      // 6. Remove user from likes, reactions, etc. on other posts
      await Uploads.updateMany(
        { likes: userid },
        { $pull: { likes: userid } },
        { session }
      );
      
      // 7. Delete the user's account from details/users collection
      await Details.findOneAndDelete({ userid : userid }, { session });
    });

    res.status(200).json({ 
      message: 'User account permanently deleted' 
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user account',
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
};
