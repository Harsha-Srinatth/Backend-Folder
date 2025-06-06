const Details  = require( '../models/Details.js');

exports.followers = async(req,res) => {
    try{

    const userId  = req.params.userId;

    if(!userId){
        return res.status(401).json({message: "userid doesnt exists" });
    };

    const user = await Details.findById(userId);

    if(!user){
        return res.status(404).json({message:"user not found"});
    }

    if(!user.followers || !Array.isArray(user.followers)){
        return res.json({ followers : [] });
    };

     await user.populate({
        path: 'followers',
        select : 'firstname username image',
        model: 'Details'
    });
    if(!Array.isArray(user.followers)){
        return res.json({ followers : [] });
    }
   
   const followers = user.followers.map(follow => {
     let userImage = null;
     if(follow.image && follow.image?.data && follow.image?.contentType){
        userImage = `data:${follow.image?.contentType};base64,${follow.image?.data.toString('base64')}`;
     }
        return  {
        _id: follow._id,
        username: follow.username || '',
        firstname : follow.firstname || '',
        image:  
            userImage
            
     };
   }).filter(Boolean);
   return  res.json({
       followers
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}