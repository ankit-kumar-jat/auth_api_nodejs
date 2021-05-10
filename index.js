/* ===================================

ISC License

Copyright (c) [2021], [Ankit Kumar Jat]

======================================*/
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo");
const express = require("express");
const session = require("express-session");
require('dotenv').config();
const authRouter = require("./reoutes/auth/main");


(async () => {
    try {
        const PORT = process.env.PORT || 3000;
        const MONGO_URI = process.env.MONGO_URI;
        const SESS_NAME = process.env.SESS_NAME;
        const SESS_SECRET = process.env.SESS_SECRET;
        const SESS_LIFETIME = process.env.SESS_LIFETIME;
        const NODE_ENV = process.env.NODE_ENV;

        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('MongoDB connected.')

        const app = express();
        app.disable('x-powered-by');

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        app.use(session({
            name: SESS_NAME,
            secret: SESS_SECRET,
            store: new MongoStore({
                mongoUrl: MONGO_URI,
                mongooseConnection: mongoose.connection,
                collection: 'session',
                ttl: parseInt(SESS_LIFETIME),
            }),
            saveUninitialized: false,
            resave: false,
            cookie: {
                sameSite: true,
                secure: NODE_ENV === 'production',
                maxAge: parseInt(SESS_LIFETIME)
            }
        }));

        app.use("/auth", authRouter);

        app.listen(PORT, () => console.log(`Server is rinning on 127.0.0.1:${PORT}`));
    }
    catch (error) {
        console.log(error);
    }
})();



