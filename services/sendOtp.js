const nodemailer = require('nodemailer')

   const transporter= nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
      auth:{
          user:'irfaanmeera@gmail.com',
          pass:'kjwl efmz fvhy mvbp'
      },
      tls:{
         rejectUnauthorized:false
      }

   });

module.exports= transporter;