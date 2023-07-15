const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticator = require('../middlewares/auth');
require('dotenv').config();


const router = express.Router(); 

router.post('/register', async (req, res) => {
    try {
        // Check that username and password are provided
        if (!req.body || !req.body.username || !req.body.password) {
            return res.status(400).json({ msg: 'Registration Failed' });
        }

        // Check if the user already exists
        const existingUser = await User.findUser(req.body.username);
        if (existingUser) {
            return res.status(401).json({ msg: 'Registration Failed' });
        }

        // Create the user
        const admin = req.body.admin || false;
        const userCreated = await User.createUser(req.body.username, req.body.password, new Date(), admin);
        if (!userCreated) {
            return res.status(500).json({ msg: 'Registration Failed' });
        }

        // Create a JWT
        const token = jwt.sign({userInfo: userCreated, timestamp: new Date().toISOString()}, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({accessToken: token, userInfo: userCreated });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    // Log in a new user. 
    try {
        // Check that username and password are provided
        if (!req.body || !req.body.username || !req.body.password) {
            return res.status(400).json({ msg: 'Login Failed' });
        }

        const authenticatedUser = await User.authenticateUser(req.body.username, req.body.password)

        if (authenticatedUser) {
            const token = jwt.sign({userInfo: authenticatedUser, timestamp: new Date().toISOString()}, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).json({accessToken: token, userInfo: authenticatedUser });
        }
        else {
            return res.status(401).json({ msg: 'Login Failed' })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/changePW', authenticator, async (req, res) => {
    try {
        if (!req.body || !req.body.old_password || !req.body.new_password || !req.body.username) {
            return res.status(400).json({ msg: 'Unauthorized' });
        }

        if (!req.user.admin && req.body.username !== req.user.userInfo.username) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
        const updatedUser = await User.changePassword(req.body.username, req.body.old_password, req.body.new_password);
        if (!updatedUser) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }
        const token = jwt.sign({userInfo: updatedUser, timestamp: new Date().toISOString()}, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({accessToken: token, userInfo: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post('/removeUser', authenticator, async (req, res) => {
    try {
        // Check that username and password are provided
        if (!req.body || !req.body.username || !req.user) {
            return res.status(400).json({ msg: 'Unauthorized' });
        }

        console.log(req.user);
        // If the current user is not an admin and they're trying to delete a different user
        if (!req.user.admin && req.body.username !== req.user.userInfo.username) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        if (await User.removeUser(req.body.username)) {
            return res.status(201).json({msg:'User Successfully removed'});
        } else {
            return res.status(401).json({ msg: 'Invalid credentials.' });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = router;