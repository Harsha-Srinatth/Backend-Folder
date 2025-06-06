const  Uploads = require("../models/Post-up.js");


exports.createPost = async (req , res) => {
    try{
        const { caption,location,tags,likes,comments } = req.body;
        const userId = req.user.userId;
        
        const newPost = new Uploads({ caption,location,tags,likes,comments,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            userId, 
        });
        await newPost.save();
        res.status(201).json({meassage: "post uploaded"});
    }
    catch(error){
        console.error("create post error " ,error)
       return res.status(500).json({message : "Server error"})
       
    }
};
