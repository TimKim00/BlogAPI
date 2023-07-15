/**
 * Route to handle the CRUD Operation of the Post.
 */


const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticator = require('../middlewares/auth');
const Post = require('../models/post');

require('dotenv').config();

const router = express.Router(); 

router.post('/create', async (req, res) => {
    try {
        // Check that owner's id, title, and content are provided.
        if (!req.body || !req.body.userId || !req.body.title || !req.body.content) {
            return res.status(400).json({ msg: 'Post Creation Failed' });
        }

        // Check if the post with the same title already exists. 
        const existingPost = await Post.findPost(req.body.userId, req.body.title);
        if (existingPost) {
            return res.status(400).json({ msg: 'Post Creation Failed' });
        }

        // Create the new post
        const postCreated = await Post.createPost(req.body.userId, req.body.title,
             req.body.content, new Date());
        if (!postCreated) {
            return res.status(500).json({ msg: 'Post Creation Failed' });
        }

        // Create a JWT
        const token = jwt.sign({ postId: postCreated }, process.env.ACCESS_TOKEN_SECRET);

        res.status(201).json({ msg: 'Post created', accessToken: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/:postId', async (req, res) => {
    // Read the post with postId. 
    const postId = req.params.postId;
    try {
        const postInfo = await Post.readPost(postId);

        if (!postInfo) {
            return res.status(500).json({msg: 'Cannot Read Post'});
        }

        const ownerInfo = await User.findUserById(postInfo.owner_id);
        const ownerName = ownerInfo ? ownerInfo.username : null; 

        // Include Comment section also 




    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
})

router.post('/removeUser', MW, async (req, res) => {
    try {
        // Check that username and password are provided
        if (!req.body || !req.body.username || !req.user) {
            return res.status(400).json({ msg: 'Unauthorized' });
        }

        // If the current user is not an admin and they're trying to delete a different user
        if (!req.user.userInfo.admin_status
             && req.body.username !== req.user.userInfo.username) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        if (await User.removeUser(req.body.username)) {
            return res.status(201).json({msg:'User Successfully removed'});
        } else {
            return res.status(401).json({ msg: 'Invalid credentials. Cannot remove the account' });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


module.exports = router;