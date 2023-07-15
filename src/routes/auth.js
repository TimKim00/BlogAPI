const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        // Check that username and password are provided
        if (!req.body || !req.body.username || !req.body.password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        // Check if the user already exists
        const existingUser = await User.findUser(req.body.username);
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create the user
        const admin = req.body.admin || false;
        const userCreated = await User.createUser(req.body.username, req.body.password, new Date(), admin);
        if (!userCreated) {
            return res.status(500).json({ msg: 'Could not create user' });
        }

        // Create a JWT
        const token = jwt.sign({ username: req.body.username }, process.env.ACCESS_TOKEN_SECRET);

        res.status(201).json({ msg: 'User created', accessToken: token });
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
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        if (await User.authenticateUser(req.body.username, req.body.password)) {
            const token = jwt.sign({ username: req.body.username }, process.env.ACCESS_TOKEN_SECRET);
            res.status(201).json({ msg: 'User Logged In', accessToken: token });
        }
        else {
            return res.status(401).json({ msg: 'Invalid credentials' })
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
})


module.exports = router;