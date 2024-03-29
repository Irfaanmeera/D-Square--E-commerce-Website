const nodemailer = require('nodemailer')

   const transporter= nodemailer.createTransport({
      service:'gmail',
      auth:{
          user:'irfaanmeera@gmail.com',
          pass:'kjwl efmz fvhy mvbp'
      }

   });

module.exports= transporter;