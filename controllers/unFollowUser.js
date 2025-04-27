const Details  = require( '../models/Details.js');

//send Follow Request 
exports.unFollowUser = async(req,res) => {
    const  currentUserId   = req.user.userId;
    const userId  = req.params.userId;

    try{
    
        const user = await Details.updateOne( { _id : currentUserId } , {
            $pull : {folowing : userId}
        })

        const targetUser = await Details.updateOne({_id : userId },
            { $pull : { followers : currentUserId }}
        )
        res.status(200).json({message: "Unfollowed Succefully"})
    
     }
    catch(err) {
        console.log("Server Error" , err);
        return res.status(500).json({message: "Server Error "})
    }
  
}