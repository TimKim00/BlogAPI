/**
 * Route to handle the CRUD Operation of the Post.
 */


const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticator = require('../middlewares/auth');
const Post = require('../models/post');
const Comment = require('../models/comment');

require('dotenv').config();

const router = express.Router();


/* Post routes */
router.post('/', authenticator, async (req, res) => {
    try {
        // Check that owner's id, title, and content are provided.
        if (!req.body || !req.body.userId
            || !req.body.title || !req.body.content) {
            return res.status(400).json({ msg: 'Post Creation Failed' });
        }

        if (req.user.userInfo.userId !== Number(req.body.userId)
            && !req.user.userInfo.adminStatus) {
            return res.status(400).json({ msg: 'Post Creation Failed' });
        }

        // Check if the post with the same title already exists. 
        const existingPost = await Post.findPostByTitle(req.body.userId, req.body.title);
        if (existingPost) {
            return res.status(409).json({ msg: 'Post Creation Failed' });
        }

        // Create the new post
        const postCreated = await Post.createPost(req.body.userId, req.body.title,
            req.body.content, new Date());
        if (!postCreated) {
            return res.status(500).json({ msg: 'Post Creation Failed' });
        }
        res.status(201).json({ postInfo: postCreated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.get('/:postId', authenticator, async (req, res) => {
    // Read the post with postId. 
    const postId = req.params.postId;
    try {
        const postInfo = await Post.findPost(postId);
        if (!postInfo) {
            return res.status(404).json({ msg: 'Post Read Failed' });
        }

        // Include Comment sectio   n also 

        // Return the post information. 
        return res.status(200).json({ postInfo: postInfo });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.put('/:postId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const userInfo = req.user.userInfo;
    try {
        if (!req.body || !req.body.title || !req.body.content) {
            return res.status(400).json({ msg: "Bad update format" });
        }

        // Handle the invite. For now, anyone can edit the post. 
        if (!userInfo.adminStatus
            && !await Post.userHasAccess(userInfo.userId, postId)) {
            return res.status(401).json({ msg: 'Failed Update' });
        }

        const updatedPost = await Post.updatePost(postId, req.body.title,
            req.body.content, new Date());

        if (!updatedPost) {
            return res.status(404).json({ msg: 'Failed Update' });
        }

        return res.status(200).json({ postInfo: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

router.delete('/:postId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const userInfo = req.user.userInfo;
    try {
        const existingPost = await Post.findPost(postId);
        if (!existingPost || (!userInfo.adminStatus
            && userInfo.userId !== existingPost.ownerId)) {
            return res.status(400).json({ msg: "Remove Failed" });
        }

        if (!await Post.removePost(postId)) {
            return res.status(404).json({ msg: "Remove Failed" });
        }
        return res.status(200).json({ msg: "Post Successfully Removed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// /* Comment routes */
// get all the comments on a specific post. 
router.get('/:postId/comments', authenticator, async (req, res) => {
    const postId = req.params.postId;
    try {
        const result = await Comment.readAllPostComments(postId);
        return res.status(200).json({ comments: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// get a single comment on a specific post. 
router.get('/:postId/comments/:commentId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    try {
        const result = await Comment.findById(postId, commentId);
        if (!result || result.hidden) {
            return res.status(404).json({msg : "Search Failed"});
        }
        return res.status(200).json({ comments: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/** Create a comment */
router.post('/:postId/comments', authenticator, async (req, res) => {
    try {
        /* Check if all the fields are present. */
        if (!req.body || !req.body.postId || !req.body.content
            || !req.body.userId) {
            return res.status(400).json({ msg: 'Comment Creation Failed.' });
        }

        const isPrivate = req.body.isPrivate ? req.body.isPrivate : false;

        const headId = req.body.headId ? req.body.headId : null;

        const result = await Comment.createComment(req.body.postId, headId
            , isPrivate, req.body.content);

        return res.status(201).json({ commentInfo: result })
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'Server error' });
    }

});

/** Edit a comment */
router.put('/:postId/comments', authenticator, async (req, res) => {
    const postId = req.params.postId;
    try {/* Check if all the fields are present. */
        if (!req.body || !req.body.content || !req.body.commentId || !req.body.userId) {
            return res.status(400).json({ msg: 'Comment Update Failed.' });
        }

        if (!req.user.userInfo.adminStatus && req.user.userInfo.userId !== req.body.userId) {
            return res.status(401).json({ msg: "Unauthorized." });
        }

        const isPrivate = req.body.isPrivate ? req.body.isPrivate : null;

        const result = await Comment.updateComment(postId, req.body.commentId, req.body.content, isPrivate);

        return res.status(200).json({ commentInfo: result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
})


router.delete('/:postId/comments/:commentId', authenticator, async (req, res) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userInfo = req.user.userInfo;
    try {
        if (!req.body || !req.body.userId) {
            return res.status(400).json({msg: "Remove Failed"});
        }

        const postInfo = await Post.findPost(postId);
        if (!postInfo) {
            return res.status(404).json({msg: 'Remove Failed'});
        }
        const ownerId = postInfo.ownerId;

        if (req.body.userId !== userInfo.userId
             && !userInfo.adminStatus && ownerId != userInfo.userId) {
            return res.status(401).json({msg: 'Remove Failed'});
        }

        if (!await Comment.removeComment(postId, commentId)) {
            return res.status(404).json({ msg: "Remove Failed" });
        }
        return res.status(204).json({msg: 'Comment Successfully removed'});
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;