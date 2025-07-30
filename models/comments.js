const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CommentsSchema = new mongoose.Schema({
       commentId: {
        type: String,
        unique: true,
        default: () => uuidv4()
       },
       postId: {
        type: String, ref: 'Uploads'
       },
       userid: {
        type: String, ref: 'Details'
       },
       comment : {
        type: String,
        required: true
       },
       createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
}   
);

const Comments = mongoose.model('Comments' , CommentsSchema);

module.exports = Comments
