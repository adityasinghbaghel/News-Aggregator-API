const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        jwt.verify(req.headers.authorization, process.env.API_SECRET, function (err, decoded) {
            if (err) {
                // Respond with an error status code and message indicating authentication failure
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            } else {
                User.findOne({
                    _id: decoded.id
                }).then(user => {
                    if (!user) {
                        // Respond with an error status code if user is not found
                        return res.status(401).json({ message: "Unauthorized: User not found" });
                    }
                    // Attach user object to the request for further processing
                    req.user = user;
                    req.message = "Found the user successfully, valid login token";
                    next();
                }).catch(err => {
                    // Handle database errors
                    console.error(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                });
            }
        });
    } else {
        // Respond with an error status code if Authorization header is not found
        return res.status(401).json({ message: "Unauthorized: Authorization header not found" });
    }
};

module.exports = verifyToken;
