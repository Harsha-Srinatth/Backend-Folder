
const express = require('express');
const Details  = require( '../models/Details.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const upload = require("../middleware/multer.js");
const { createPost } = require('../controllers/create-Post.js');
const { likes } = require('../controllers/likes.js')
const Uploads = require('../models/Post-up.js');
const Comments = require('../models/comments.js')
const { createComments } = require('../controllers/comments.js');
const { deleteComments } = require('../controllers/deleteComment.js')


const router = express.Router();
require('dotenv').config();

router.post("/register",async (req,res)=> {
    try{
      console.log('Request Body:',req.body);
      const {firstname,username,email,password} = req.body;
      if(!firstname ||!username ||!email || !password){
        return res.status(400).json({message: "All fields are required"});
      }
      const user1 = await Details.findOne({email});
      if(user1){
          return res.status(400).json({message: "Email is already exists"});
      }
      const hashPassword = await bcrypt.hash(password,10);
      const user = new Details({
          firstname,
          username,
          email,
          password : hashPassword
      });
      await user.save();
      res.status(200).json({message:"User saved"})
      }catch(error){
        console.error("error in above code:",error);
        return  res.status(500).json({message:"server error"})
      }
}
);


router.post('/login', async(req,res)=> {
  const {email,password} = req.body;
  try{
    let user = await Details.findOne({email})
    if(!user){
     return res.status(404).json({message: "user not found"});
    }
    const isMatch = await bcrypt.compare(password , user.password);

    if(!isMatch){
      return res.status(404).json({message: "Password is incorrect"});
    }
    const token = jwt.sign({
      userId : user._id,
      firstname : user.firstname,
      username: user.username,
      email : user.email,
     },process.env.mySecretKey,{
      expiresIn : '1h',
     });

    res.json({
      token, user: {
        userId: user._id,
        firstname: user.firstname,
        username: user.username,
        email : user.email,
      }
    });
   
  }catch(err){
      console.error("error in above code:",err);
       return res.status(500).json({message:"server error"});
  }
});
const checkauth = (req,res,next) => {
  try{ 
  if(!req.header('Authorization')){
    return res.status(401).json({meassage: " No authorization Header , access denied"});
  }
  const token = req.header('Authorization')?.split(' ')[1];
   if (!token){
    return res.status(401).json({meassage : "No token, authorization denied"});
   }
    const decoded  = jwt.verify(token,process.env.mySecretKey);
    req.user = decoded;
    next();
   }catch(error){
    console.error(error);
    return res.status(401).json({meassage : "Token is not valid"});
   }
};


router.get("/",checkauth ,async(req,res)=>{
    
  try{
    res.json({
      message: "Access granted to protected router",
      user : req.user
    });
  }catch(error){
    console.error("Dashboard error", error );
    return res.status(500).json({message : "server error"});
  };
  
});
router.get('/explore', async(req,res)=>{
  try{
    const Users = await Details.find();
    return res.status(201).json(Users);
  }catch(err){
    console.error(err);
    return res.status(500).json({message : "server error"});
  }
});

router.post("/create-post" , upload.single("image") , checkauth, createPost);

router.get("/post", async(req,res)=>{
    try{
        const post = await Uploads.find();
        return res.status(201).json(post);
    }catch(error){
      console.error(error);

      return res.status(500).json({message : "server error"});
    }
});
const getUserPosts = async(req,res) => {
  try {
      const userId = req.user.userId
      const posts = await Uploads.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(posts);
  }catch(err){
      console.error(err);
      res.status(500).json({message: err.message})
  }
};
const getComments = async(req,res) => {
    try{
      const { postId } = req.params;
      const comments = await Comments.find({ post: postId }).populate( 'user','username')
      .sort({createdAt: -1});
      res.status(200).json(comments);
    }catch(error){
        console.error("server error", error);
        return res.status(500).json({message: "server error"})
    }
};

router.get('/:postId/comments' , getComments);

router.get("/user/posts", checkauth, getUserPosts);

router.post("/:postId/like", checkauth, likes );

router.post("/:postId/comment", checkauth,  createComments );

router.delete('/comments/:commentId',checkauth, deleteComments);


module.exports = router;