const nodemailer = require('nodemailer');

const sendEmail = async (options) =>{

    //STEP 1: CREATE A TRANSPORTER(MailTrap)
    const transporter = nodemailer.createTransport({
        //service:'Gmail', //Yahoo, etc...
        host: process.env.EMAIL_HOST, 
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

    })

    //STEP 2: DEFINE EMAIL OPTIONS 
    const mailOptions = {
        from: 'Nir Ithzak <niritzhak10.devel@gmail.com', 
        //note : options.email,options.subject , options.text => email is an argument to the cb passed to the NodeMailer
        to: options.email,
        subject:options.subject, 
        //TEXT VERSION - LATER WILL HAVE HTML
        text:options.message,
        //html
    }

    //STEP 3: SEND THE EMAIL 
    await transporter.sendMail(mailOptions); 




}




module.exports = sendEmail; 