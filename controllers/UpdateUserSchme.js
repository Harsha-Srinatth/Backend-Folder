const Details  = require( '../models/Details.js');

exports.updateUserDetails = async(req,res) =>{
    try{
        const userId = req.user.userId;
        const updatedUser = await Details.findByIdAndUpdate(userId , 
            { $set : req.body },
            { new: true }
        );
        if(!updatedUser){
            return res.status(404).json({message: "user not Found"})
        }
     res.status(201).json({message: "User succeffully Updated"})
    }
   catch(err){
    console.log(err);
    return res.status(500).json({message: "Server Error"});
   }
}