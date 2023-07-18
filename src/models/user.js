const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const Post = require('./post');

const User = {
    dummyUserId: null,
    // Define methods for interacting with the User table in your database.
    // For example, you might have a method to find a user by username,
    // a method to create a new user, etc.

    async findUser(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rowCount > 0 ? result.rows[0] : null;
    },

    async findUserById(userId) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rowCount > 0 ? filterUserInfo(result.rows[0]) : null;
    },

    async createUser(username, password, isAdmin) {
        const hashedPassword = generateHashedPassword(password);
        const result = await pool.query('INSERT INTO users (username, password, is_admin,'
            + 'creation_date, last_update) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, hashedPassword, isAdmin, new Date(), new Date()]);
        return result.rowCount > 0 ? filterUserInfo(result.rows[0]) : null;
    },

    async authenticateUser(username, password) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rowCount === 0) {
            return false;
        }
        const hashedPassword = result.rows[0].password;
        return validateUserCredentials(password, hashedPassword) ?
            filterUserInfo(result.rows[0]) : null;
    },

    async changePassword(username, oldPassword, newPassword) {
        const user = await this.findUser(username);
        if (user && validateUserCredentials(oldPassword, user.password)) {
            const newHashedPW = generateHashedPassword(newPassword);
            const result = await pool.query('UPDATE users SET password = $1, last_update = $3 WHERE id = $2 RETURNING *',
                [newHashedPW, user.id, new Date()]);
            return result.rowCount > 0 ? filterUserInfo(result.rows[0]) : null;
        } else {
            return null;
        }
    },

    async removeUser(username) {
        let result;

        // Start transaction
        await pool.query('BEGIN');

        try {

            // Query to get the userId of the user to be removed
            const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
            const userId = userResult.rows[0].id;


            // Soft remove comments by the user.
            result = await pool.query(
                `UPDATE comments 
                 SET removed = true 
                 WHERE owner_id = (SELECT id FROM users WHERE username = $1)`,
                [username]
            );

            // Remove all invites by this user.
            result = await pool.query(
                `DELETE FROM invites
                 WHERE post_id IN (
                     SELECT post_id FROM posts
                     WHERE owner_id = (SELECT id FROM users WHERE username = $1)
                 )`,
                [username]
            );

            result = await pool.query(`
            DELETE FROM invites
            WHERE user_id = (SELECT id FROM users WHERE username = $1)`, [username]);
            

            // Soft remove all the posts that only has comments written by the user
            result = await pool.query(
                `UPDATE posts 
                 SET removed = true 
                 WHERE owner_id = (SELECT id FROM users WHERE username = $1)
                 AND NOT EXISTS (
                     SELECT 1 FROM comments 
                     WHERE comments.post_id = posts.id AND comments.owner_id != posts.owner_id
                     AND comments.removed = false
                 )`,
                [username]
            );

            // Update the posts which should not be deleted
            result = await pool.query(`UPDATE posts SET owner_id = $1 WHERE owner_id = $2`, [this.dummyUserId, userId]);
            result = await pool.query('UPDATE comments SET owner_id = $1 WHERE owner_id = $2', [this.dummyUserId, userId]);


            result = await pool.query('SELECT * FROM posts WHERE owner_id = $1', [userId]);

            // Remove user
            result = await pool.query(
                `DELETE FROM users 
                 WHERE username = $1`,
                [username]
            );

            if (result.rowCount <= 0) throw new Error('Failed to remove user.');

            // Commit transaction if all queries were successful
            await pool.query('COMMIT');

            return true;
        } catch (err) {
            console.error(err);
            // Rollback transaction if any queries failed
            await pool.query('ROLLBACK');
            return false;
        }
    },

    async createDummyUser() {
        const username = '';
        const password = '';

        // Check if the dummy user already exists
        let userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (userResult.rowCount === 0) {
            // The dummy user does not exist, create a new one
            userResult = await pool.query('INSERT INTO users (username, password, is_admin, creation_date) '
             + ' VALUES ($1, $2, $3, $4) RETURNING *', [username, password, false, new Date()]);
        }
        this.dummyUserId = userResult.rows[0].id;
    }

};

function validateUserCredentials(password, storedPassword) {
    try {
        // Generate the hashed password using the provided username and password
        const isPasswordValid = bcrypt.compareSync(password, storedPassword);

        return isPasswordValid;
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        throw new Error('User credential validation failed');
    }
}

function generateHashedPassword(password) {
    const saltRounds = 10;
    // Generate a salt and hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    return hashedPassword;
}

function filterUserInfo(userInfo) {
    return {
        userId: userInfo.id,
        username: userInfo.username,
        adminStatus: userInfo.is_admin,
        accountCreationDate: userInfo.creation_date
    };
}

module.exports = User;
