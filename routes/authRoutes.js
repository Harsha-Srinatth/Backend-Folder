
const express = require('express');
const Details  = require( '../models/Details.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const multer = require('multer');
const { createPost } = require('../controllers/create-Post.js');
const { likes } = require('../controllers/likes.js')
const Uploads = require('../models/Post-up.js');
const Comments = require('../models/comments.js')
const { createComments } = require('../controllers/comments.js');
const { deleteComments } = require('../controllers/deleteComment.js');
const { searchUsers } = require('../controllers/searchUsers.js');
const { updateUserDetails } = require('../controllers/UpdateUserSchme.js');
const { sendFollowRequests } =require('../controllers/sendFollowRequests.js');
const { unFollowUser } = require('../controllers/unFollowUser.js');
const { getCUDetails} = require('../controllers/getCUDetails.js');
const {  uploadProfileImg } =require('../controllers/uploadProfileImg.js')
const { deletePost } = require('../controllers/deletePost.js');
const { following } = require('../controllers/following.js');
const { followers } = require('../controllers/followers.js')

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
router.get('/explore/search', checkauth, searchUsers);

   
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create-post" , upload.single("image") , checkauth, createPost);
router.post('/upload-profile-img' , upload.single("profilePhoto") , checkauth , uploadProfileImg);

router.get('/all-Details/C-U',checkauth , async(req,res) => {
  const  userId  = req.user.userId;
  try{
    const details = await Details.findById(userId);

    return res.status(200).json(details);
  }catch(error){
    console.log(error);
    return res.status(500).json({message: "server error"});
  }
}
);

// router.get('/all-Details/U/:userId' , async(req,res) => {
//   const userId = req.params.userId;
//   console.log(userId,"receiverd ")
//   try{
//     const userDetails = await Details.findById(userId).select("image _id");
//     return res.status(200).json(userDetails);

//   }catch(error){
//     console.log("server Error",error);
//     return res.status(500).json({message: "server error"})
//   }
// })
// router.get("/post/:postId", async(req,res)=> {
//   try{
//     const post = await Uploads.find(req.params.postId);

//      if(!post || !post.image || !post.image.data){
//           return res.status(404).send("image not found");
//       }

//      res.set('Content-Type', post.image.contentType || 'image/jpeg');
//      return res.send(post.image.data);

//   }catch(error){
//     console.error(error);
//     return res.status(500).json({message: " Server Error"})
//   }
// })

router.get("/post", async(req,res)=>{
    try{
        const post = await Uploads.find().populate('userId', 'username image').lean();
        if(!post || post.length == 0){
          return res.status(404).json({message: "post not found"});
        }
        const formattedpost = post.map(post => {
          let postImage = null;
          let userImage = null;
          if(post.image && post.image?.data && post?.image?.contentType){
              postImage = post.image?.data ? `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`:null;
          }
          let userInfo = null;

          const userData = post.user || post.userId || {};
          if(userData){
            userInfo = {
              _id : userData._id || "",
              username: userData.username || ""
            };

          if(userData.imageUrl) {
            userImage = userData.imageUrl;
          }else if(userData.image){
            if(userData.image.imageUrl){
              userImage = userData.image.imageUrl;
            }
          }else if(userData.image.data && userData.image.contentType){
            try{
              if(typeof userData.image.data === 'string' && userData.image.data.startsWith('data:')){
                userImage = userData.image.data;
              }else{
                const imageData = Buffer.isBuffer(userData.image.data) ? userData.image?.data.toString('base64') : userData.image.data;
                userImage = `data:${userData.image.contentType};base64,${ imageData }`;
              }         
            }catch(error){
              console.error("Error formating user image",error);
            }
          }
        }
        return { ...post,
            imageUrl: postImage,
            user: {
              ...userInfo,
              imageUrl: userImage
            }
          };
        });

        if(formattedpost.length > 0){
          console.log(JSON.stringify({
            postImage : formattedpost[0].imageUrl ? "present" : "Null",
            userId:formattedpost[0].userId?._id,
            userImage : formattedpost[0].user?.imageUrl ? "present" : "Null"
          }))
        }

        return res.status(201).json(formattedpost);
    }
    catch(error)
    {
      console.error("Failed to fetch posts",error);
      return res.status(500).json({message : "server error"});
    }
});
const getUserPosts = async(req,res) => {
  try {
    if(!req.user || !req.user.userId){
      return res.status(401).json({message : " Unauthorized"})
    }
      const userId = req.user.userId;
      const post = await Uploads.find({ userId }).sort({ createdAt: -1 }).populate('userId','username image').lean();
      if(!post || post.lenght == 0){
        return res.status(200).json({message : "no posts found", post: []});
      }  

        const formattedpost = post.map(post => {
    
          const postImage = post.image && post.image?.data ? `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`:null;
          const user = post.userId;
          const userImage = user && user.image && user?.image?.data ? `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`:null;
          return { ...post,
            imageUrl: postImage,
            user: {
              _id : user?._id,
              username: user?.username,
              imageUrl: userImage
            }
          };
        });

      return res.status(201).jsos(formattedpost);
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

// router.get('/:userId/list-followers' , async(req,res) => {
//   try
//   {
//     const userId = req.params.userId;
//     const user = await Details.findById(userId).populate('followers', 'username firstname image');
//     return res.status(201).json({
//       followers: user.followers
//   });
//   }
//   catch(error)
//   {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error"});
//   }
 
// })
router.delete('/posts/:postId',checkauth ,deletePost );

router.get('/following-list/:userId',following);
router.get('/followers-list/:userId', followers);

router.get('/:postId/comments' , getComments);

router.get("/user/posts", checkauth, getUserPosts);

router.post("/:postId/like", checkauth, likes );

router.post("/:postId/comment", checkauth,  createComments );

router.delete('/comments/:commentId',checkauth, deleteComments);

router.put('/Update/your/details' , checkauth, updateUserDetails);

router.post('/follow/:userId', checkauth, sendFollowRequests);
router.post('/unfollow/:userId', checkauth , unFollowUser);

router.get('/getDetails' ,checkauth, getCUDetails);

router.get('/user/:userId' , checkauth ,  async(req,res) => {
  
  const  userId  = req.params.userId;
  const  currentUserId  = req.user.userId;
  console.log("received userId",userId);
  console.log("receiverd currentUserId" , currentUserId);

  if(!userId){
    return res.status(400).json({message: "userID not found"})
  }

  try{
    const user = await Details.findById(userId).lean();
    if(!user){
      return res.status(404).json({message: "User not found"})
    }
    const FollowingCount = user.following ? user.following.length : 0;
    const FollowersCount = user.followers ? user.followers.length : 0;
    const isFollowing  = user.followers.includes(currentUserId);
    user._id = user._id.toString();
    res.status(200).json({user, 
      FollowingCount,
      FollowersCount,
      isFollowing
    });

  }catch(err){
    console.log(err);
    return res.status(500).json({message:"server errror"})
  }
});

module.exports = router;