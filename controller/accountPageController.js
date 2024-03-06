const addressCollection = require('../models/addressModel')
const userCollection = require('../models/userModel')
const cartCollection = require('../models/cartModel')
const categoryCollection = require('../models/categoryModel')

//user account page get controller
const userAccountPageLoad = async (req,res)=>{
    try{
        let userData= await userCollection.findOne({_id:req.session.user._id})
        let addressData = await addressCollection.find({userId:req.session.user._id})
        const count = await cartCollection.countDocuments({
            userId: req.session?.user?._id,
          });
        let categoryData = await categoryCollection.find({})


        console.log(addressData)

        res.render('user/userProfile',{userData, user:req.session.user,addressData,count,categoryData})
    }catch(error){
        console.log(error)
    }
}

//user add new address post controller
const addAddressPost= async(req,res)=>{
    try{

        const address =new addressCollection({
            userId: req.session.user._id,
            addressTitle: req.body.addressTitle,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            phone: req.body.phone,
          });

          const addressData = await address.save()
          console.log(addressData)

          res.redirect('/userAccount')
        
    }catch(error){
        console.log(error)
    }
}


//edit address post
const editAddress = async(req,res)=>{
    try{
        const address = {
            addressTitle: req.body.addressTitle,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            phone: req.body.phone,
          };
          await addressCollection.updateOne({ _id: req.params.id }, address);
          res.redirect('/userAccount')

    }catch(error){
        console.log(error)
    }
}

//deleteAddress post
const deleteAddress = async(req,res)=>{
    try{
       const deleteAddressData = await addressCollection.findOneAndDelete({_id:req.params.id})
       res.redirect('/userAccount')
    }catch(error){
        console.log(error)
    }
}




module.exports = {userAccountPageLoad,addAddressPost,editAddress,deleteAddress}
