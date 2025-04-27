
const mongoose = require('mongoose')
const DetailSchema = new mongoose.Schema({
       
        firstname : {
            type: String,
            required : true
        },
        username: {
            type: String,
            required: true
        },
        email : {
            type : String,
            required: true,
            unique: true
        },
        password : {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ""
        },
        isPrivate: {
            type: Boolean , default: false
        },
         followers: [{
                type: mongoose.Schema.Types.ObjectId , ref: 'Details',default: []
            }],
         following: [{
                type: mongoose.Schema.Types.ObjectId , ref: 'Details',default: []
            }],
        followRequests: [{
                type: mongoose.Schema.Types.ObjectId,ref: 'Details',default: []
            }]
    }
);

const Details = mongoose.model('Details' , DetailSchema);

module.exports = Details

