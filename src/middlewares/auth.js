const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

module.exports = async function(req, res, next) {
    // Check for a token in the request headers.
    // If a token is found, verify it using jwt.verify().
    // If the token is valid, extract the user data and attach it to the request object.
    // If the token is not valid, send a 401 Unauthorized response.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Bearer <token>

    if (!token) {
        return res.status(401).json({ msg: 'Unauthorized'});
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        req.user = decoded;
        const lastTimestamp = await pool.query('SELECT last_update FROM users WHERE id = $1', [decoded.userInfo.userId]);

        if (lastTimestamp.rows[0].last_update > new Date(decoded.timestamp)
         || !req.user || !req.user.userInfo) {
            res.status(401).json({msg: 'Unauthorized'});
            return;
        }
        next();
    } catch (err) {
        res.status(401).json({msg: 'Unauthorized'});
    }
}
