
const Details  = require( '../models/Details.js');

exports.getCUDetails =  async(req,res) => {
  
  const  userId  = req.query.userId;
  if(!userId){
    return res.status(400).json({message: "userID not found"})
  }

  try{
    const details = await Details.findById(userId);
   
    const FollowingCount = details.following ? details.following.length : 0;
    const FollowersCount = details.followers ? details.followers.length : 0;

    res.status(200).json({details, 
      FollowingCount,
      FollowersCount,
    });

  }catch(err){
    console.log(err);
    return res.status(500).json({message:"server errror"})
  }
};