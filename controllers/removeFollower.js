const Details = require('../models/Details.js');
const mongoose = require('mongoose');

// Remove Follower - allows a user to remove someone from their followers list
exports.removeFollower = async(req,res) => {
    const currentUserId = req.user.userId;
    const followerUserId = req.params.userId;
    
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            // First, check if the current user exists
            const currentUser = await Details.findOne({ userid: currentUserId }).session(session);
            if (!currentUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({message: "Current user not found"});
            }

            // Check if the follower user exists
            const followerUser = await Details.findOne({ userid: followerUserId }).session(session);
            if (!followerUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({message: "Follower user not found"});
            }

            // Check if the follower is actually following the current user
            if (!currentUser.followers.includes(followerUserId)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message: "This user is not following you"});
            }

            // Remove the follower from current user's followers list
            const currentUserUpdateResult = await Details.updateOne(
                { userid: currentUserId },
                { $pull: { followers: followerUserId }},
                { session }
            );

            // Remove current user from follower's following list
            const followerUpdateResult = await Details.updateOne( 
                { userid: followerUserId },
                { $pull: { following: currentUserId }},
                { session }
            );

            if( currentUserUpdateResult.modifiedCount === 0 && followerUpdateResult.modifiedCount === 0){
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message: "Follower relationship not found"});
            }

            // Verify the changes
            const updatedCurrentUser = await Details.findOne({ userid: currentUserId }).session(session);
            const updatedFollowerUser = await Details.findOne({ userid: followerUserId }).session(session);
            

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ 
                message: "Follower removed successfully",
                followersCount: updatedCurrentUser.followers.length,
                followingCount: updatedFollowerUser.following.length
            });
        }catch(error){
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    catch(err) {
        console.log("Server Error" , err);
        return res.status(500).json({message: "Server Error"})
    }
} 