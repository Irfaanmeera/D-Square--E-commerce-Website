const mongoose = require('mongoose')


const bannerSchema= mongoose.Schema({
   image:{type:String,required:true}
},{timeStamps:true})

const bannerCollection = mongoose.model('banners',bannerSchema)

module.exports = bannerCollection;