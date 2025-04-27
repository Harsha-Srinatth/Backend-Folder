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

    res.status(201).json(users);
  }catch(err){
    console.error(err);
    return res.status(500).json({message : "server error"});
  }
}