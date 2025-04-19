const  Uploads = require("../models/Post-up.js");

const Comments = require("../models/comments.js");

exports.createComments = async(req,res) => {
    const userId = req.user.userId;
    const { text } = req.body;
    const { postId } = req.params;
    
    try{

       const comment = new Comments({ post: postId, user: userId, text });
       await comment.save();
       const post = await Uploads.findById(req.params.postId);

      const updatedPost = await Uploads.findByIdAndUpdate(postId,{
        $push : {
            comments: comment._id
        }
        },
        { new:true }
        );
       res.status(201).json({comment,
        count: updatedPost.comments.length
    });
    }catch(err){
        console.error("server error:", err);
        return res.status(500).json({message:"server error "})
    }
   
}