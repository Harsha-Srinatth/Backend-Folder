const Details  = require( '../models/Details.js');

exports.following = async(req,res) => {
    try{

    const userId  = req.params.userId;
    const rawUser = await Details.findOne({userid: userId});
    if(!userId){
        return res.status(401).json({message: "userid doesnt exists" });
    };
    const user = await Details.findOne({userid: userId});
    if(!user){
        return res.status(404).json({message:"user not found"});
    }
    if(!user.following || !Array.isArray(user.following)){
        return res.json({ following : [] });
    };
    
   const following = await Promise.all(user.following.map(async (followUserId) => {
     try {
       const followUser = await Details.findOne({ userid: followUserId });
       if (!followUser) return null;
       
       let userImage = null;
       if (followUser.image && followUser.image?.data && followUser.image?.contentType) {
         userImage = `data:${followUser.image?.contentType};base64,${followUser.image?.data.toString('base64')}`;
       }
       
       return {
         userId: followUser.userid,
         username: followUser.username || '',
         fullname: followUser.fullname || '',
         image: userImage
       };
     } catch (error) {
       console.error('Error fetching following user:', error);
       return null;
     }
   }));
   
   const validFollowing = following.filter(Boolean);
   
   return  res.json({
       following: validFollowing
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}