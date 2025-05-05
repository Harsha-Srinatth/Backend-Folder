const Details  = require( '../models/Details.js');
const mongoose = require('mongoose');

//send Follow Request 
exports.unFollowUser = async(req,res) => {
    const  currentUserId   = req.user.userId;
    const userId  = req.params.userId;
    console.log(userId,"revecived user Id");
    console.log(currentUserId,"received user Id fpr from the token");
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            const userUpdatedResult = await Details.updateOne(
                { _id : currentUserId },
                { $pull : { following : userId }},
                { session }
            );

            const targetUpdateResult = await Details.updateOne( 
                { _id : userId },
                { $pull : { followers : currentUserId }},
                { session }
            );
            if( userUpdatedResult.modifiedCount === 0 && targetUpdateResult.modifiedCount === 0){
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message : "Not following this user"});
            }
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({ message:"Unfollowed Succesfully"})
        }catch(error){
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    catch(err) {
        console.log("Server Error" , err);
        return res.status(500).json({message: "Server Error "})
    }
  
}