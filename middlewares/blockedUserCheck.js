const userCollection = require('../models/userModel')

const blockedUser = async(req,res,next)=>{
    try{
      let user = await userCollection.findOne({id:req.session?.user?._id})

      if(user?.isBlocked){
        req.session.destroy();
        res.send('You are blocked by admin')
      }else{
        next()
      }

    }catch(error){
        console.log(error)
    }
}

module.exports = blockedUser;