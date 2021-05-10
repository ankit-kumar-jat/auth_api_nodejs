const { Router } = require("express");
const { isAuthenticated, isNotAuthenticated } = require("../../utils/helpers");
const User = require("../../models/user");
const { parseError, sessionizeUser } = require("../../utils/helpers");
const { signUp, signIn } = require("../../validation/user");
require("dotenv").config();

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

module.exports = authRouter;