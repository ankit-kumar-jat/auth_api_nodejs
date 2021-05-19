/* ===================================

ISC License

Copyright (c) [2021], [Ankit Kumar Jat]

======================================*/
const { sendEmail } = require("./sendMail");

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    }
    else {
        res.status(401).json({
            "success": false,
            "message": "Please login to continue"
        });
    }
}

const isNotAuthenticated = (req, res, next) => {
    if (req.session.user) {
        res.status(403).json({
            "success": false,
            "message": "You are already logged in"
        });
    } else {
        next();
    }
}

const parseError = (err) => {
    console.log(err);
    if (err.isJoi) return { "sucess": false, "message": err.details[0].message };
    else if (err.errors) {
        return {
            "success": false,
            // "error": err._message,
            "message": err.errors[Object.keys(err.errors)[0]].message,
        }
    }
    else if (err.stack) {
        return {
            "success": false,
            // "error": err.message,
            "message": err.message,
        }
    }
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
}

const sessionizeUser = user => {
    return { userId: user.id, username: user.username };
}

const saveResetToken = async (resetPasswordToken, resetPasswordExpires, userId, Reset) => {
    const newReset = new Reset({ resetPasswordToken, resetPasswordExpires, userId });
    await newReset.save();
    return { "resetPasswordToken": resetPasswordToken, "tokenId": newReset._id };
}

const sendMail = (token) => {
    console.log(token);
    sendEmail(`<p><strong>token</strong>: ${token.resetPasswordToken}<br> <strong>tokenid: ${token.tokenId}</p>`, 'ankjat066@gmail.com', 'Password reset token');

}

module.exports.sessionizeUser = sessionizeUser;
module.exports.parseError = parseError;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isNotAuthenticated = isNotAuthenticated;
module.exports.saveResetToken = saveResetToken;
module.exports.sendMail = sendMail;
