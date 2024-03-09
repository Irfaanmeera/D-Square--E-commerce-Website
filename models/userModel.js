const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true,
    },
    isBlocked:{
        type: Boolean, 
        default: false,
    },
    referralCode: { 
        type: String, 
        default: null }
    
});



//Export the model
module.exports = mongoose.model('users', userSchema);