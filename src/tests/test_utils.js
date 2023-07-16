const pool = require('../config/db');

const Utils = {
    async clearDataBase() {
        await this.clearInvites();
        await this.clearComments();
        await this.clearPosts();
        await this.clearUser();
        return;
    }, 

    async clearUser() {
        await pool.query('DELETE FROM users');
        return;
    },

    async clearPosts() {
        await pool.query('DELETE FROM posts');
        return;
    },

    async clearInvites() {
        await pool.query('DELETE FROM invites');
        return;
    },
    async clearComments() {
        await pool.query('DELETE FROM comments');
        return;
    },

    /** Check whether all comments were returned. */
    checkComments(allComments, allCommentId) {
        function traverseComments(comment) {
            if (comment === []) {
                return true;  // return true when there are no comments
            }

            for (let child of comment) {
                if (!allCommentId.includes(child.commentId) || !traverseComments(child.replies)) {
                    // If commentId is not in allCommentId or any of the child's replies is invalid, return false
                    return false;
                }
            }
            return true;  // return true if all comments and replies are valid
        }
    return traverseComments(allComments);
}

}

module.exports = Utils;
