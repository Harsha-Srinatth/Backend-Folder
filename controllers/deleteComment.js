const  Uploads = require("../models/Post-up.js");
const Comments = require('../models/comments.js');


exports.deleteComments = async(req,res) => {
    try{
        const { commentId } = req.params;
        const { postId } = req.body;
        const userId = req.user.userId;
        const comment = await Comments.findById(commentId);
        if(!comment){
            return res.ststus(404).json({message: " comment  not Found"})
        }
        if(comment.user.toString() !== userId.toString()) {
            return res.status(403).json({message: "Unauthotized: You con Only Delete Your own Comment"});
        }
        
         await Comments.findByIdAndDelete(commentId);
        
      
        const updatedPost =  await Uploads.findByIdAndUpdate(postId,{
            $pull : {
                comments: commentId
            }
        },{ new:true });
        
        res.status(200).json({message: "Comment Deleteed Successufully" ,
            count: updatedPost?.comments?.length || 0}
        );
       
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Server Error"});
    }
}