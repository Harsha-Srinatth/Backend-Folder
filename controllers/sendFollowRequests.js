
const Details  = require( '../models/Details.js');

//send Follow Request 
exports.sendFollowRequests = async(req,res) => {
    const currentUserId  = req.user.userId;
    const userId  = req.params.userId;
    console.log("received currentUserId" , currentUserId);
    console.log("received targetUserId",userId);
    console.log("Received body",req.body);

    try{
        const user = await Details.findById(currentUserId);
        const targetUser = await Details.findById(userId);

        if(!userId || !currentUserId){
            return res.status(404).json({meassage: "Cannot Found Users"});
        }

        if(targetUser.isPrivate){
           
            if(!targetUser.followRequests.includes(currentUserId))
            {
                targetUser.followRequests.push(currentUserId);
                await targetUser.save();
                return res.status(200).json({message: "Follow Request Sent"});
            }
            else{
               return res.status(400).json({message: "Already Sent Request"})
            }

        }else{
            if(!user.following.includes(userId))
            {
                user.following.push(userId);
                await user.save();
                targetUser.followers.push(currentUserId);
                await targetUser.save();

                const FollowingCount = user.following.length;
                const FollowersCount = user.followers.length;
                
                res.status(200).json({message: "Followed Succefully" ,
                    FollowingCount,
                    FollowersCount
                })
            }else{
                return res.status(400).json({message: "Already Following"})
            }
        }    
    }
    catch(err) {
        console.log("Server Error" , err);
        return res.status(500).json({message: "Server Error "})
    }
  
}
