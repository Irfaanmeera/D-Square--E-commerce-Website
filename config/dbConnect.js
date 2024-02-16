const mongoose = require("mongoose");

const dbConnect= ()=>{
    try{
    const connection =  mongoose.connect("mongodb://127.0.0.1:27017/Project-1");
    console.log("Database Connected Successfully");
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = dbConnect;