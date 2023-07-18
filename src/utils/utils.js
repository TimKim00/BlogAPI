const pool = require('../config/db');
const User = require('../models/user');

const Utils = {

    // Initialize the database. 
    async initializeDatabase() {
        await Utils.clearDataBase();
        await User.createDummyUser();
    },
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
}

module.exports = Utils;
