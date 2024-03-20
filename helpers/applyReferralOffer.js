const userCollection = require("../models/userModel");
const walletCollection = require("../models/walletModel");

const applyReferralOffer = async (referralCode) => {
  try {
    let referralCodeExists = await userCollection.findOne({ referralCode });

    if (referralCodeExists) {
      let walletTransaction = {
        transactionDate: new Date(),
        transactionAmount: 500,
        transactionType: "Referral offer applied",
      };
      await walletCollection.updateOne(
        { userId: referralCodeExists._id },
        { $inc: { walletBalance: 500 }, $push: { walletTransaction } }
      );
      console.log("Referral Applied");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = applyReferralOffer;
