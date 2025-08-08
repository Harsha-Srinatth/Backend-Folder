const  Uploads = require("../models/Post-up.js");

exports.likes = async(req,res) => {
    try{
        const userId = req.user.userId;
        const postId = req.params.postId;
        const post = await Uploads.findOne({postId: postId});

        if(!post){
            return res.status(404).json({error: "post not Found"});
        }

        const liked = post.likes.includes(userId);
       
        if(liked){
            post.likes = post.likes.filter((id)=>
                id.toString() !== userId);
        }else{
            post.likes.push(userId);
        }
       
        await post.save();
        res.status(200).json({
            likesCount: post.likes.length,
            likedByUser: !liked,
            userAlreadyLiked: post.likes.includes(userId)
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "server error"})
    }
};