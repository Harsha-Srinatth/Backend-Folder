
const Details  = require( '../models/Details.js');

exports.getCUDetails = async (req, res) => {
  const userId = req.user.userId;
  
  if(!userId) {
    return res.status(400).json({ message: "userID not found" });
  }
  
  try {
    const details = await Details.findById(userId);
    
    if (!details) {
      return res.status(404).json({ message: "User details not found" });
    }
    
    const followingCount = details.following ? details.following.length : 0;
    const followersCount = details.followers ? details.followers.length : 0;
    
    // Convert user document to a plain object
    const userDetails = details.toObject();
    
    // Process user image if exists
    let userImage = null;
    if(user.image && user.image?.data && user.image?.contentType){
        userImage = `data:${user.image?.contentType};base64,${user.image?.data.toString('base64')}`;
    }
    
    // Prepare response with all required fields
    const response = {
      ...userDetails,
      image: {
        imageUrl: userImage
      },
      followingCount,
      followersCount
    };
    console.log( response);    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};