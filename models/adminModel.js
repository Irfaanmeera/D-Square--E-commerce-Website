const mongoose = require('mongoose'); 


var adminSchema = new mongoose.Schema({
   
    email:{
        type:String,
    },
   
    password:{
        type:String,
    },
});


module.exports = mongoose.model('admin', adminSchema);
