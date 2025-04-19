const  Uploads = require("../models/Post-up.js");


exports.createPost = async (req , res) => {
    try{
        const { caption,location,tags,likes,comments } = req.body;
        const userId = req.user.userId;
        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const newPost = new Uploads({ caption,location,tags,likes,comments,
            image: imageUrl,
            userId, 
        })
        await newPost.save();
        res.status(201).json({meassage: "post uploaded"});
    }
    catch(error){
        console.error("create post error " ,error)
       return res.status(500).json({message : "Server error"})
       
    }
};
