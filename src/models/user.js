const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    // Define methods for interacting with the User table in your database.
    // For example, you might have a method to find a user by username,
    // a method to create a new user, etc.

    async findUser(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rowCount > 0? result.rows[0] : null;
    },

    async findUserById(userId) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return result.rowCount > 0? filterUserInfo(result.rows[0]) : null;
    },

    async createUser(username, password, creationDate, isAdmin) {
        const hashedPassword = generateHashedPassword(password);
        const creationTimestamp = creationDate.toISOString();
        const result = await pool.query('INSERT INTO users (username, password, is_admin, creation_date, last_update) VALUES ($1, $2, $3, $4, $5) RETURNING *',
         [username, hashedPassword, isAdmin, creationDate, creationTimestamp]);
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
            const timestamp = new Date().toISOString();
            const result = await pool.query('UPDATE users SET password = $1, last_update = $3 WHERE id = $2 RETURNING *', [newHashedPW, user.id, timestamp]);
            return result.rowCount > 0 ? filterUserInfo(result.rows[0]) : null;
        } else {
            return null;
        }
    },

    async removeUser(username) {
        const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);
        return result.rowCount > 0;
    },
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
    return {user_id: userInfo.id,
            username: userInfo.username,
            admin_status: userInfo.is_admin,
            account_creation_date: userInfo.creationDate };
}

module.exports = User;
