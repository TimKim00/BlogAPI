const pool = require('../config/db');

const Utils = {
    async clearDataBase() {
        await this.clearUser();
        await this.clearComments();
        await this.clearPosts();
        await this.clearInvites();
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
    }
}
module.exports = Utils;
