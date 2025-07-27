
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
const { removeFollower } = require('../controllers/removeFollower.js');
const { getCUDetails} = require('../controllers/getCUDetails.js');
const {  uploadProfileImg } =require('../controllers/uploadProfileImg.js')
const { deletePost } = require('../controllers/deletePost.js');
const { following } = require('../controllers/following.js');
const { followers } = require('../controllers/followers.js');
const { uploadProfileImage } = require('../middleware/uploadProfileImage.js')

const router = express.Router();
require('dotenv').config();

router.post("/register",async (req,res)=> {
    try{
      const {fullname,username,userid,email,password} = req.body;
      if(!fullname ||!username ||!email || !password || !userid){
        return res.status(400).json({message: "All fields are required"});
      }
      const user1 = await Details.findOne({email});
      if(user1){
          return res.status(400).json({message: "Email is already exists"});
      }
      const user2 = await Details.findOne({userid});
      if(user2){
        return res.status(400).json({message: "Userid is already exists"});
      }
      const hashPassword = await bcrypt.hash(password,10);
      const user = new Details({
          fullname,
          username,
          userid,
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

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    let user = await Details.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).json({ message: "invalid email or password" });
    }
    const token = jwt.sign(
      {
        userId: user.userid,
        username: user.username,
        email: user.email,
      },
      process.env.mySecretKey,
      { expiresIn: '1d' }
    );
   return res.json({
      token,
      user: {
        userId: user.userid,
        username: user.username,
        email: user.email,
      },
    });
    
  } catch (err) {
    console.error("error in above code:", err);
    return res.status(500).json({ message: "server error" });
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
const upload = multer({ storage: storage});

router.post("/create-post" , upload.single("image") , checkauth, createPost);
router.post('/upload-profile-img' ,checkauth , uploadProfileImage, uploadProfileImg);

router.get('/all-Details/C-U',checkauth , async(req,res) => {
  const  userId  = req.user.userId;
  try{
    const details = await Details.findOne({userid: userId});
    let userImage = null;
    if(details.image && details.image?.data && details.image?.contentType){
      userImage = `data:${details.image?.contentType};base64,${details.image?.data.toString('base64')}`;
    }

    return res.status(200).json({...details
      , image: userImage
    });
  }catch(error){
    console.log(error);
    return res.status(500).json({message: "server error"});
  }
}
);

router.get("/post", async(req,res)=>{
    try{
        const post = await Uploads.find({}).lean();
        if(!post || post.length == 0){
          return res.status(404).json({message: "post not found"});
        }
        const formattedpost = post.map(post => {
          let postImage = null;
          if(post.image && post.image?.data && post?.image?.contentType){
              postImage = post.image?.data ? `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`:null;
          }
          let userImage = null;
          if(post.userid.image && post.userid.image?.data && post.userid.image?.contentType){
              userImage = post.userid.image?.data ? `data:${post.userid.image?.contentType};base64,${post.userId.image?.data.toString('base64')}`:null;
          }
       
        return { ...post,
            imageUrl: postImage,
            user: {
              imageUrl: userImage || null
            }
          };
        });

        if(formattedpost.length > 0){
          console.log(JSON.stringify({
            postImage : formattedpost[0].imageUrl ? "present" : "Null",
            userId:formattedpost[0].userid,
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

      return res.status(201).json(formattedpost);
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

router.delete('/posts/:postId',checkauth ,deletePost );

router.get('/following-list/:userId',following);
router.get('/followers-list/:userId', followers);

router.get('/:postId/comments' , getComments);

router.get("/user/posts", checkauth, getUserPosts);

router.post("/:postId/like", checkauth, likes );

router.post("/:postId/comment", checkauth,  createComments );

router.delete('/comments/:commentId',checkauth, deleteComments);

router.put('/Update/your/details' , checkauth, uploadProfileImage, updateUserDetails);

router.post('/follow/:userId', checkauth, sendFollowRequests);
router.post('/unfollow/:userId', checkauth , unFollowUser);
router.post('/remove-follower/:userId', checkauth, removeFollower);

router.get('/getDetails' ,checkauth, getCUDetails);

router.get('/user/:userId' , checkauth ,  async(req,res) => {
  
  const  userId  = req.params.userId;
  const  currentUserId  = req.user.userId;
  console.log("received userId",userId);
  console.log("received currentUserId" , currentUserId);

  if(!userId){
    return res.status(400).json({message: "userID not found"})
  }

  try{
    const user = await Details.findOne({ userid: userId }).lean();
    if(!user){
      return res.status(404).json({message: "User not found"})
    }
    const FollowingCount = user.following ? user.following.length : 0;
    const FollowersCount = user.followers ? user.followers.length : 0;
    
    // Convert ObjectIds to strings for proper comparison
    const followersString = user.followers ? user.followers.map(id => id.toString()) : [];
    const isFollowing = followersString.includes(currentUserId.toString());
    
    user._id = user._id.toString();
    let userImage = null;
    if(user.image && user.image?.data && user.image?.contentType){
      userImage = `data:${user.image?.contentType};base64,${user.image?.data.toString('base64')}`;
    }
    res.status(200).json({...user, 
      FollowingCount,
      FollowersCount,
      isFollowing,
      image: {
        userImage
      },
    });

  }catch(err){
    console.log(err);
    return res.status(500).json({message:"server error"})
  }
});

module.exports = router;