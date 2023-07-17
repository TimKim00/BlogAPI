const pool = require('../config/db');
const Post = require('./post');

const Comment = {
    /* Define methods for creating, removing, updating, and retreiving the comment. */

    async createComment(postId, headId, isPrivate, content) {
        const ownerId = await Post.findPost(postId);
        const result = await pool.query('INSERT INTO comments '
            + '(post_id, owner_id, comment_id, content, creation_date, edit_date, '
            + 'removed, is_private) VALUES ($1, $2, $3, $4, $5, $5, false, $6) RETURNING *'
            , [postId, ownerId.ownerId, headId, content, new Date(), isPrivate]);
        return result.rowCount > 0 ? commentFilter(result.rows[0]) : null;
    },

    /* finds a signle comment */
    async findById(commentId, userInfo, postId) {
        const result = await pool.query('SELECT * from comments WHERE id = $1 AND post_id = $2'
            , [commentId, postId])
        const postInfo = await pool.query('SELECT owner_id FROM posts WHERE id = $1', [postId]);
        const ownerId = postInfo.rows[0].owner_id;
        return result.rowCount > 0 && postInfo.rowCount > 0 
        ? filterPrivateComments(userInfo, commentFilter(result.rows[0]), ownerId) : null;
    },

    /* Returns all the comments associated to the post. */
    async readAllPostComments(postId, userInfo) {
        const result = await pool.query('SELECT * FROM comments WHERE post_id = $1 AND comment_id IS NULL', [postId]);
        const postInfo = await pool.query('SELECT owner_id FROM posts WHERE id = $1', [postId]);
        if (result.rowCount > 0 && postInfo.rowCount > 0) {
            const ownerId = postInfo.rows[0].owner_id;
            const comments = result.rows.map((comment) => {
                return commentFilter(comment, 'reply');
            });
            for (let i = 0; i < comments.length; i++) {
                const replies = await this.readAllReplies(comments[i].commentId, userInfo, ownerId);
                comments[i].replies = replies;
            }
            // console.log(comments[0].replies);
            return comments;
        } else {
            return null;
        }
    },

    /* Reads all the comment's replies. */
    async readAllReplies(commentId, userInfo, ownerId) {
        let replies = new Array();
        replies = await this.findReplies(commentId, userInfo, ownerId);
        if (replies.length === 0) {
            return replies;
        }
        replies = await Promise.all(
            replies.map(async (replyId) => {
                const reply = await this.readAllReplies(replyId.commentId, userInfo, ownerId); // Recursively fetch the replies
                if (reply instanceof Error) {
                    throw reply;
                }
                replyId.replies = reply;
                return replyId;
            })
        );
        return replies;
    },

    /* Finds all the comments that are directly rooted by the HEADID */
    async findReplies(headId, userInfo, ownerId) {
        const result = await pool.query('SELECT * FROM comments WHERE comment_id = $1', [headId]);
        const replies = result.rows.map((reply) => {
            return filterPrivateComments(userInfo, commentFilter(reply, 'reply'), ownerId);
        });

        return replies;
    },

    /* Updates the comment */
    async updateComment(postId, commentId, content, isPrivate) {
        const existingData = await pool.query('SELECT '
         + '* FROM comments WHERE id = $1 AND removed = false', [commentId]);
        
        if (existingData.rowCount === 0 || Number(postId) !== Number(existingData.rows[0].post_id)) {
            return null;
        }

        if (existingData.rows[0].content === content
             && existingData.rows[0].is_private === isPrivate) {
            // No update is needed. Return the existing content. 
            return commentFilter(existingData.rows[0]);
        }

        const result = await pool.query('UPDATE comments SET content = $1, '
         + 'edit_date = $2, is_private = $3 WHERE id = $4 RETURNING *',
          [content, new Date(), isPrivate, commentId]);

        return result.rowCount > 0 ? commentFilter(result.rows[0]) : null;
    },

    async removeComment(postId, commentId) {
        const result = await pool.query('UPDATE comments SET removed = true '
        + 'WHERE id = $1 AND post_id = $2', [commentId, postId]);
        return result.rowCount > 0;
    },
}

function commentFilter(commentInfo, option) {
    const defaultRet = {
        commentId: commentInfo.id,
        postId: commentInfo.post_id,
        ownerId: commentInfo.owner_id,
        headId: commentInfo.comment_id,
        content: commentInfo.content,
        creationDate: commentInfo.creation_date,
        updateDate: commentInfo.edit_date,
        removed: commentInfo.removed,
        isPrivate: commentInfo.is_private
    } 

    switch (option) {
        case 'read':
            return {
                ...defaultRet,
                content: commentInfo.removed ? '' : defaultRet.content,
            }
        case 'reply':
            return {
                ...defaultRet,
                content: commentInfo.removed ? '' : defaultRet.content,
                replies: [],
            }
        default:
            return defaultRet;
    }
}


/* Filters the private comments. Checks whether the user defined in USERINFO
can view COMMENTINFO for the comment whose post owner is OWNERID.  */
function filterPrivateComments(userInfo, commentInfo, ownerId) {
    if (!userInfo.adminStatus && userInfo.userId !== commentInfo.ownerId
        && userInfo.userId !== ownerId && commentInfo.isPrivate) {
            // Has no access to view the private message
            return {
                ...commentInfo,
                content: null,
                creationDate: null,
                updateDate: null,
                ownerId: null
            }
        }
    return commentInfo;
}

module.exports = Comment;