const { Router } = require("express");
const { isAuthenticated, isNotAuthenticated } = require("../../utils/helpers");
const User = require("../../models/user");
const Reset = require("../../models/reset");
const { parseError, sessionizeUser, saveResetToken, sendMail } = require("../../utils/helpers");
const { signUp, signIn, updatePassword, Email } = require("../../validation/user");
require("dotenv").config();
const { hashSync } = require("bcryptjs");
const crypto = require("crypto");

/* ===================================

ISC License

Copyright (c) [2021], [Ankit Kumar Jat]

======================================*/
const authRouter = Router();
const SESS_NAME = process.env.SESS_NAME;

authRouter.get("/", isAuthenticated, (req, res) => {
    res.json({
        "success": true,
        "userId": req.session.user.userId,
        "username": req.session.user.username
    });
});

authRouter.post("/register", isNotAuthenticated, async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        await signUp.validateAsync({ username, email, password, confirmPassword });
        if (password === confirmPassword) {
            const newUser = new User({ username, email, password });
            await newUser.save();
            res.status(201).json({
                "success": true,
                "message": "registered successfully"
            });
        } else {
            res.status(201).json({
                "success": false,
                "message": "password do not match"
            });
        }
    } catch (err) {
        res.status(400).send(parseError(err));
    }
});

authRouter.post("/login", isNotAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;
        await signIn.validateAsync({ email, password });
        const user = await User.findOne({ email });
        if (user && user.comparePasswords(password)) {
            const sessionUser = sessionizeUser(user);

            req.session.user = sessionUser;
            res.send({ "success": true, "username": sessionUser.username, "userId": sessionUser.userId, "message": `Logged in as ${sessionUser.username}` });
        } else {
            throw new Error('Invalid login credentials');
        }
    } catch (err) {
        res.status(400).send(parseError(err));
    }
});

authRouter.delete("/logout", isAuthenticated, (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) throw (err);
            res.clearCookie(SESS_NAME);
            res.json({ "success": true, "message": "Logout successfully" });
        });
    } catch (err) {
        res.status(400).send(parseError(err));
    }
});


authRouter.post("/update-pass", isAuthenticated, async (req, res) => {
    try {
        const { oldPassword, password, confirmPassword } = req.body;
        const _id = req.session.user.userId;
        await updatePassword.validateAsync({ password, confirmPassword });
        const user = await User.findOne({ _id });
        if (user && user.comparePasswords(oldPassword)) {
            let newPassword = hashSync(password, 10);
            const dbresponse = await User.findOneAndUpdate({ _id }, { password: newPassword });
            console.log(dbresponse);
            req.session.destroy(err => {
                if (err) throw (err);
                res.clearCookie(SESS_NAME);
                res.json({ "success": true, "message": "Password updated successfully" });
            })
        } else {
            throw new Error('Invalid login credentials');
        }
    } catch (err) {
        res.status(400).json(parseError(err));
    }
});

authRouter.post("/forget-pass", isNotAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;
        await Email.validateAsync({ email });
        const user = await User.findOne({ email });
        if (user) {
            const resetPasswordToken = crypto.randomBytes(32).toString('hex');
            const resetPasswordExpires = Date.now() + 3600000; //expires in an hour
            const userId = user._id;
            const oldToken = await Reset.findOne({ userId });
            if (oldToken) {
                oldToken.deleteOne();
                const token = await saveResetToken(resetPasswordToken, resetPasswordExpires, userId, Reset);
                // send this token via email to user
                sendMail(token);
                res.json({ "success": true, "message": "Reset token generated" })
            }
            else {
                const token = await saveResetToken(resetPasswordToken, resetPasswordExpires, userId, Reset);
                // send this token via email to user
                sendMail(token);
                res.json({ "success": true, "message": "Reset token generated" })
            }
        } else {
            throw new Error('User not found');
        }
    } catch (err) {
        res.status(400).json(parseError(err));
    }
});

authRouter.post("/reset-pass", isNotAuthenticated, async (req, res) => {
    try {
        const { tokenId, resetPasswordToken, password, confirmPassword } = req.body;
        const token = await Reset.findOne({ _id: tokenId });
        if (token && token.compareTokens(resetPasswordToken)) {
            if (token.resetPasswordExpires > Date.now()) {
                const _id = token.userId;
                await updatePassword.validateAsync({ password, confirmPassword });
                const user = await User.findOne({ _id });
                if (user) { // && compareToken.validateAsync(user.resetPasswordToken, resetToken)
                    let newPassword = hashSync(password, 10);
                    await User.findOneAndUpdate({ _id }, { password: newPassword });
                    await token.deleteOne();
                    res.json({ "success": true, "message": "Password updated sucessfully" });
                } else {
                    throw new Error('User not found');
                }
            } else {
                token.deleteOne();
                res.status(403).send({ "success": false, "message": "Rest token expired" });
            }
        } else {
            res.status(403).send({ "success": false, "message": "reset token expired" });
        }
    } catch (err) {
        res.status(400).json(parseError(err));
    }
});

module.exports = authRouter;