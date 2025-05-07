const Details  = require( '../models/Details.js');

exports.followers = async(req,res) => {
    try{

    const { userId } = req.params;
    if(!userId){
        return res.status(401).json({message: "userid doesnt exists"});
    }
    const user = await Details.findById(userId).populate('followers' , 'username firstname image');
    if(!user){
        return res.status(404).json({message:"user not found"});
    }
    res.status(201).json({
       followers : user.followers
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}