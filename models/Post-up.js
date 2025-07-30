
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const PostUpload = new mongoose.Schema({
    postId: {
        type: String,
        unique: true,
        default: () => uuidv4()
    },
    caption : {
        type: String,
        required: true
    },
    location : {
        type: String,
        required: true
    },
    tags : {
        type : String,
        required: true
    },
    likes: [{
        type: String, ref: 'Details'
    }],
    comments: [{
         type: String, ref: 'comment'
    }],
    image : {
       data: Buffer,
       contentType: String,
    },
    userid: {
       type: String, ref: 'Details', required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    

});

const Uploads =  mongoose.model('Uploads' , PostUpload);

module.exports = Uploads

