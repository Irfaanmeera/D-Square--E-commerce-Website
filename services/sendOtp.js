const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: true,
//     auth: {
//         user: process.env.GMAIL_ID,
//         pass: process.env.GMAIL_PASSWORD,
//         method: 'PLAIN' // Ensure the authentication method is specified
//     }
// });

const transporter = nodemailer.createTransport({
    service:'gmail',
    port: 465,
    secure: true,
    logger:true,
    debug:true,
    secureConnection:false,
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD,
        
    },
    tls:{
      rejectUnAuthorised : true,
    }
});



// Rest of your email sending logic...
module.exports = transporter;