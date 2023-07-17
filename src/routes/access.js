/**
 * Route to handle the Post access control.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticator = require('../middlewares/auth');
const Post = require('../models/post');

require('dotenv').config();

const router = express.Router();

/* Invites users */
router.post('/:postId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const userInfo = req.user.userInfo;
    try {
        const postInfo = await Post.findPost(postId);

        if (!req.body || !validateInvites(req.body.invitees, postInfo.ownerId)) {
            return res.status(400).json({ msg: 'Invite Failed'});
        }

        if (!postInfo) {
            return res.status(404).json({ msg: 'Invite Failed'});
        }

        if (postInfo.ownerId !== userInfo.userId && !userInfo.adminStatus) {
            return res.status(401).json({msg: 'Invite Failed'});
        } 

        const result = await Post.sharePost(postId, req.body.invitees);
        return res.status(201).json({accessInfo: result});

    } catch (err) {
        console.log(err);
        res.status(500).json({msg: 'Server error'});
    }
});

/* Revoke invites */
router.delete('/:postId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const userInfo = req.user.userInfo;
    try {
        const postInfo = await Post.findPost(postId);

        if (!req.body || !validateInvites(req.body.revokeList, postInfo.ownerId)) {
            return res.status(400).json({ msg: 'Revoke Failed'});
        }

        if (!postInfo) {
            return res.status(404).json({ msg: 'Revoke Failed'});
        }

        if (postInfo.ownerId !== userInfo.userId && !userInfo.adminStatus) {
            return res.status(401).json({msg: 'Revoke Failed'});
        } 

        const result = await Post.revokeInvites(postId, req.body.revokeList);
        return res.status(200).json({revokeList: result});

    } catch (err) {
        console.log(err);
        res.status(500).json({msg: 'Server error'});
    }
});

function validateInvites(invitees, ownerId) {
    if (!invitees || invitees.length === 0) {
        return false;
    }
    for (let invitee of invitees) {
        if (typeof(invitee) !== "number" || invitee === ownerId) {
            return false;
        }
        
    }
    return true;
}



module.exports = router;