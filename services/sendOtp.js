const nodemailer = require('nodemailer')

// const sendOtp = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.GMAIL_ID ,
//       pass: process.env.GMAIL_PASS
//     },
// });



   const transporter= nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
          user:'irfaanmeera@gmail.com',
          pass:'tayk wqro aapk jryl'
      }

   });

module.exports= transporter;