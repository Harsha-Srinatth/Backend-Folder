const Details  = require( '../models/Details.js');

exports.updateUserDetails = async(req,res) =>{
    try{
        const userId = req.user.userId;
        const updateData = { ...req.body };
        if(req.file){
            // Convert buffer to base64 and create a complete data URL
            const base64Image = req.file.buffer.toString('base64');
            const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
            updateData.image = dataUrl;
        }
        const updatedUser = await Details.findOneAndUpdate({userid: userId}, 
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