
const Details  = require( '../models/Details.js');

exports.getCUDetails =  async(req,res) => {
  
  const  userId  = req.user.userId;
  if(!userId){
    return res.status(400).json({message: "userID not found"})
  }

  try{
    const details = await Details.findById(userId);
   
    const FollowingCount = details.following ? details.following.length : 0;
    const FollowersCount = details.followers ? details.followers.length : 0;

     const userProfiles = details.map(user => {
      let userImage = null;
      
      if(user.image && user.image?.data && user.image?.contentType){
        userImage = `data:${user.image?.contentType};base64,${user.image?.data.toString('base64')}`;
      }
      
      return { 
        ...details.toObject(),
        image: {
          imageUrl: userImage
        }
      };
    });

    res.status(200).json({userProfiles, 
      FollowingCount,
      FollowersCount,
    });

  }catch(err){
    console.log(err);
    return res.status(500).json({message:"server errror"})
  }
};