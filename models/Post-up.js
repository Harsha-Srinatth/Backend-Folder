
const mongoose = require('mongoose');

const PostUpload = new mongoose.Schema({
  
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
        type: mongoose.Schema.Types.ObjectId , ref: 'Details'
    }],
    comments: [{
         type: mongoose.Schema.Types.ObjectId , ref: 'comment'
    }],
    image : {
       data: Buffer,
       contentType: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId , ref: 'Details', required:true
    },
    

});

const Uploads =  mongoose.model('Uploads' , PostUpload);

module.exports = Uploads

