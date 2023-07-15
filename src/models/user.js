const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    // Define methods for interacting with the User table in your database.
    // For example, you might have a method to find a user by username,
    // a method to create a new user, etc.

    async findUser(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    },

    async createUser(username, password, creationDate, isAdmin) {
        const hashedPassword = generateHashedPassword(password);
        const result = await pool.query('INSERT INTO users (username, password, is_admin, creation_date) VALUES ($1, $2, $3, $4)', [username, hashedPassword, isAdmin, creationDate]);
        return result.rowCount > 0;
    },

    async authenticateUser(username, password) {
        const result = await pool.query('SELECT password FROM users WHERE username = $1', [username]);
        if (result.rowCount === 0) {
            return false;
        }
        const pw = result.rows[0].password;
        return validateUserCredentials(password, pw);
    },

    async changePassword(username, oldPassword, newPassword) {
        const user = await this.findUser(username);
        if (user && validateUserCredentials(oldPassword, user.password)) {
            const newHashedPW = generateHashedPassword(newPassword);
            const result = await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPW, old_row['id']]);
            return result.rowCount > 0;
        } else {
            return false;
        }
    },

    async removeUser(username) {
        const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);
        return result.rowCount > 0;
    },

    async userIsAdmin(username) {
        const result = await pool.query('SELECT is_admin FROM users WHERE username = $1', [username]);
        if (result) {
            return result.rows[0].is_admin;
        }
        else {
            return false;
        }
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

module.exports = User;
