
const  Uploads = require("../models/Post-up.js");
const mongoose = require('mongoose');

exports.deletePost = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { postId } = req.params;
        console.log(postId);

        const post = await Uploads.findOne({ postId: postId });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userid.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your posts" });
        }

        await Uploads.deleteOne({ postId: postId });

        return res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
};