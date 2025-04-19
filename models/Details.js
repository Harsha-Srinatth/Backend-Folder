
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
        }
    }
);

const Details = mongoose.model('Details' , DetailSchema);

module.exports = Details

