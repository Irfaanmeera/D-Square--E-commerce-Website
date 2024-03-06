const nodemailer = require('nodemailer')

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