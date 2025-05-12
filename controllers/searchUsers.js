const Details  = require( '../models/Details.js');
const mongoose = require('mongoose');

exports.searchUsers = async(req,res)=>{
  const { username } = req.query;
  const userId = req.user.userId;
 
  if(!username){
    return res.status(400).json({error: "Username query vis required"});
  }
  
  try{
    const currentUserId = new mongoose.Types.ObjectId(userId);
    const currentUserIdString = currentUserId.toString();
    const users = await Details.find({ username : {
      $regex: username,
      $options:"i"
    }, _id: { $ne: currentUserIdString }
  });
  const userProfiles = users.map(image => {
     let userImage = null;
        if(image.image && image.image?.data && image.image?.contentType){
          userImage = image.image?.data ? `data:${image.image?.contentType};base64,${image.image?.data.toString('base64')}`:null;
        }
         return { ...users,
              image: {
              imageUrl: userImage
            }
          };
  });
        console.log(userProfiles); 

    res.status(201).json(userProfiles);
  }catch(err){
    console.error(err);
    return res.status(500).json({message : "server error"});
  }
}