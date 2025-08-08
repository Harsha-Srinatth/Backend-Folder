const Details  = require( '../models/Details.js');
const mongoose = require('mongoose');

exports.searchUsers = async (req, res) => {
  const userid = req.user.userId;
  const { username } = req.query;

  if(!username) {
    return res.status(400).json({error: "Username or firstName query is required"});
  }

  try{
// Build query object based on provided parameters
    let queryObj = {};
    
    if (username) {
      queryObj.username = { $regex: username, $options: "i" };
    }
    
    const users = await Details.find({userid: { $ne: userid }}, { username: 1, image: 1, fullname:1, userid:1 });
    
    const userProfiles = users.map(user => {
      let userImage = null;
      
      if(user.image && user.image?.data && user.image?.contentType){
        userImage = `data:${user.image?.contentType};base64,${user.image?.data.toString('base64')}`;
      }
      
      return { 
        ...user.toObject(),
        image: {
          imageUrl: userImage
        },
        username: user.username    // Ensure username is in response
      };
    });
    
    res.status(201).json(userProfiles);
  }catch(err){
    console.error(err);
    res.status(500).json({message: "server error"});
  }
}