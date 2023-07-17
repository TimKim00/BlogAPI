/**
 * Route to handle the post search queries
 */


const express = require('express');
const jwt = require('jsonwebtoken');
const authenticator = require('../middlewares/auth');
const Post = require('../models/post');

const router = express.Router(); 

/** Searches all the posts according to the search information provided. 
 *  If the serach information has no information or is null, return all queries. 
 */
router.get('/', authenticator, async (req, res) =>  {
    try {
        const result = await Post.searchPosts(req.body);
        if (!result) {
            return res.status(404).json({msg: "Search Failed"});
        }
        return res.status(200).json({searchInfo: result});
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: 'Server error'});
    }
})

module.exports = router;