const Details  = require( '../models/Details.js');

exports.updateUserDetails = async(req,res) =>{
    try{
        const userId = req.user.userId;
        const updateData = { ...req.body };
        if(req.file){
            updateData.image = {
            data: req.file.buffer,
            contentType: req.file.mimetype
           };
        }
        const updatedUser = await Details.findByIdAndUpdate(userId , 
            { $set : updateData },
            { new: true }
        );
        if(!updatedUser){
            return res.status(404).json({message: "user not Found"})
        }
     res.status(201).json({message: "User succeffully Updated", user: updatedUser});
    }
   catch(err){
    console.log(err);
    return res.status(500).json({message: "Server Error"});
   }
}