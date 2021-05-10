/* ===================================

ISC License

Copyright (c) [2021], [Ankit Kumar Jat]

======================================*/

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

module.exports.sessionizeUser = sessionizeUser;
module.exports.parseError = parseError;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isNotAuthenticated = isNotAuthenticated;
