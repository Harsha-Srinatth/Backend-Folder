const mongoose = require('mongoose')
const CommentsSchema = new mongoose.Schema({
       post: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Uploads'
       },
       user: {
        type: mongoose.Schema.Types.ObjectId , ref: 'Details'
       },
       text : {
        type: String,
        required: true
       },
       createdAt: {
        type: Date,
        default: Date.now
    }
    }
);

const Comments = mongoose.model('Comments' , CommentsSchema);

module.exports = Comments
