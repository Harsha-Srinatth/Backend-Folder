
const Details  = require( '../models/Details.js');
const mongoose = require('mongoose');

//send Follow Request 
exports.sendFollowRequests = async(req,res) => {
    const currentUserId  = req.user.userId;
    const userId  = req.params.userId;

    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const user = await Details.findOne({ userid: currentUserId }).session(session);
            const targetUser = await Details.findOne({ userid: userId }).session(session);

            if(!user || !targetUser){
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({message: "Cannot Found Users"});
            }

            if(targetUser.isPrivate){
                if(!targetUser.followRequests.includes(currentUserId)) {
                    await Details.updateOne(
                        { userid: userId },
                        { $addToSet: { followRequests: currentUserId }},
                        { session }
                    );
                    await session.commitTransaction();
                    session.endSession();
                    return res.status(200).json({message: "Follow Request Sent"});
                } else {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({message: "Already Sent Request"})
                }
            } else {
                if(!user.following.includes(userId)) {
                    // Update current user's following list
                    await Details.updateOne(
                        { userid: currentUserId },
                        { $addToSet: { following: userId }},
                        { session }
                    );

                    // Update target user's followers list
                    await Details.updateOne(
                        { userid: userId },
                        { $addToSet: { followers: currentUserId }},
                        { session }
                    );

                    // Get updated counts
                    const updatedUser = await Details.findOne({ userid: currentUserId }).session(session);
                    const updatedTargetUser = await Details.findOne({ userid: userId }).session(session);
                    
                    const FollowingCount = updatedUser.following.length;
                    const FollowersCount = updatedTargetUser.followers.length;
                    
                    await session.commitTransaction();
                    session.endSession();
                    
                    res.status(200).json({
                        message: "Followed Successfully",
                        FollowingCount,
                        FollowersCount
                    });
                } else {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({message: "Already Following"})
                }
            }
        } catch(error) {
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
