const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    // Check for a token in the request headers.
    // If a token is found, verify it using jwt.verify().
    // If the token is valid, extract the user data and attach it to the request object.
    // If the token is not valid, send a 401 Unauthorized response.
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied. '});
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid. '});
    }
}
