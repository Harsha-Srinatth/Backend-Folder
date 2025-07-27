
const  Uploads = require("../models/Post-up.js");
const mongoose = require('mongoose');

exports.deletePost = async(req,res) => {
    try{
        const userId = req.user.userId;
        const { postId } = req.params;

        // Validate postId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({message: "Invalid post ID format"});
        }
       
        const Posts = await Uploads.findById(postId);

        if(Posts.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: "Unauthotized: You con Only Delete Your Posts"});
        }
        
        await Uploads.findByIdAndDelete(postId);

        await Uploads.findByIdAndUpdate(postId,{
            $pull : postId
        },{ new:true });
        
        res.status(201).json({message: "post Deleted succefully"});
        
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Server Error"})
    }
}