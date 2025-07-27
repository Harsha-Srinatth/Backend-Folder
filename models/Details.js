
const mongoose = require('mongoose')
const DetailSchema = new mongoose.Schema({
       
        fullname : {
            type: String,
            required : true
        },
        username: {
            type: String,
            required: true
        },
        userid: {
            type: String,
            required: true,
            unique: true
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
            data: Buffer,
            contentType: String,
        },
        isPrivate: {
            type: Boolean , default: false
        },
         followers: [{
                type:String , ref: 'Details',default: []
            }],
         following: [{
                type: String , ref: 'Details',default: []
            }],
        followRequests: [{
                 type: String ,ref: 'Details',default: []
            }]
    }
);

const Details = mongoose.model('Details' , DetailSchema);

module.exports = Details

