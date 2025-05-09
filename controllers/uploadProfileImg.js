const Details = require('../models/Details')

exports.uploadProfileImg = async(req,res) => {
    const userId = req.user.userId;

    console.log("received, user Id for Upload Profile photo" , userId);
    try{
        
        const user  = await Details.findByIdAndUpdate(userId ,
            {image : {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            } },
            {new : true, runValidators:false }
        );
        
        res.status(200).json(user);
    }catch(error){
        console.log(error);
        return res.status(500).json({message: "Server Error"});
    }
}