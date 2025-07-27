const Details  = require( '../models/Details.js');
const mongoose = require('mongoose');

//send Follow Request 
exports.unFollowUser = async(req,res) => {
    const  currentUserId   = req.user.userId;
    const userId  = req.params.userId;
    console.log(userId,"received user Id");
    console.log(currentUserId,"received user Id from the token");
    
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            // First, check if the current user is actually following the target user
            const currentUser = await Details.findOne({ userid: currentUserId }).session(session);
            if (!currentUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({message: "Current user not found"});
            }

            // Check if the target user exists
            const targetUser = await Details.findOne({ userid: userId }).session(session);
            if (!targetUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({message: "Target user not found"});
            }

            // Check if already following
            if (!currentUser.following.includes(userId)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message: "Not following this user"});
            }

            console.log("Before unfollow - Current user following:", currentUser.following);
            console.log("Before unfollow - Target user followers:", targetUser.followers);

            const userUpdatedResult = await Details.updateOne(
                { userid: currentUserId },
                { $pull : { following : userId }},
                { session }
            );

            const targetUpdateResult = await Details.updateOne( 
                { userid: userId },
                { $pull : { followers : currentUserId }},
                { session }
            );

            console.log("Update results:", {
                userUpdated: userUpdatedResult.modifiedCount,
                targetUpdated: targetUpdateResult.modifiedCount
            });

            if( userUpdatedResult.modifiedCount === 0 && targetUpdateResult.modifiedCount === 0){
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message : "Not following this user"});
            }

            // Verify the changes
            const updatedCurrentUser = await Details.findOne({ userid: currentUserId }).session(session);
            const updatedTargetUser = await Details.findOne({ userid: userId }).session(session);
            
            console.log("After unfollow - Current user following:", updatedCurrentUser.following);
            console.log("After unfollow - Target user followers:", updatedTargetUser.followers);

            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ 
                message: "Unfollowed Successfully",
                followingCount: updatedCurrentUser.following.length,
                followersCount: updatedTargetUser.followers.length
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