const  Uploads = require("../models/Post-up.js");
const Details = require("../models/Details.js");
const Comments = require("../models/comments.js");

exports.createComments = async(req,res) => {
    const userId = req.user.userId;
    const { text } = req.body;
    const { postId } = req.params;
    
    try{
        // Create the comment
        const comment = new Comments({ postId: postId, userid: userId, comment: text });
        await comment.save();

        // Fetch user details (username and image)
        const user = await Details.findOne({ userid: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Convert image Buffer to base64 string
        let userimageBase64 = null;
        if (user.image && user.image.data) {
            userimageBase64 = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
        }

        // Update the post with the new comment
        const updatedcomments = await Uploads.findOneAndUpdate(
            { postId: postId },
            {
                $push: {
                    comments: comment.commentId
                }
            },
            { new: true }
        );

        // Return comment with user details
        res.status(201).json({
            comment: {
                ...comment.toObject(),
                username: user.username,
                userimage: userimageBase64,
            },
            count: updatedcomments ? updatedcomments.comments.length : 0,
        });
    } catch(err) {
        console.error("server error:", err);
        return res.status(500).json({ message: "server error" });
    }
}

exports.getComments = async(req,res) => {
    const { postId } = req.params;
    
    try {
        // Get all comments for the post
        const comments = await Comments.find({ postId: postId }).sort({ createdAt: -1 });
        
        // Fetch user details for each comment
        const commentsWithUserDetails = await Promise.all(
            comments.map(async (comment) => {
                const user = await Details.findOne({ userid: comment.userid });
                
                // Convert image Buffer to base64 string
                let userimageBase64 = null;
                if (user && user.image && user.image.data) {
                    userimageBase64 = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
                }
                
                return {
                    ...comment.toObject(),
                    username: user ? user.username : 'Unknown User',
                    userimage: userimageBase64
                };
            })
        );

        res.status(200).json({
            comments: commentsWithUserDetails,
            count: commentsWithUserDetails.length
        });
    } catch(err) {
        console.error("server error:", err);
        return res.status(500).json({ message: "server error" });
    }
}