const Details  = require( '../models/Details.js');

exports.following = async(req,res) => {
    try{

    const userId  = req.params.userId;
    console.log(userId ,"following list of user id");
    const rawUser = await Details.findById(userId);
    console.log("raw user data :", JSON.stringify(rawUser,null,2));

    if(!userId){
        return res.status(401).json({message: "userid doesnt exists" });
    };
    const user = await Details.findById(userId);
    if(!user){
        return res.status(404).json({message:"user not found"});
    }
    if(!user.following || !Array.isArray(user.following)){
        return res.json({ following : [] });
    };
    console.log("Following length :" ,user.following.length)
     await user.populate({
        path: 'following',
        select : 'firstname username image',
        model: 'Details'
    });
    if(!Array.isArray(user.following)){
        return res.json({ following : [] });
    }
   const following = user.following.map(follow => {
    let userImage = null;
     if(follow.image && follow.image?.data && follow.image?.contentType){
        userImage = `data:${follow.image?.contentType};base64,${follow.image?.data.toString('base64')}`;
     }
        return  {
        _id: follow._id,
        username: follow.username || '',
        firstname : follow.firstname || '',
        image: userImage
     };
   }).filter(Boolean);
   
   return  res.json({
       following
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}