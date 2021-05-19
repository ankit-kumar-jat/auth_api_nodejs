var nodemailer = require('nodemailer');

const USER = process.env.MAIL_USER;
const PASS = process.env.MAIL_PASS;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASS
    }
});



const sendEmail = (body, to, subject) => {
    const mailOptions = {
        from: 'any@any.com', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: body// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    })
}

module.exports.sendEmail = sendEmail;