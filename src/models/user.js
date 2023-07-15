const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    // Define methods for interacting with the User table in your database.
    // For example, you might have a method to find a user by username,
    // a method to create a new user, etc.

    async findUser(username) {
        try {
            const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0];
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async createUser(username, password, creationDate, isAdmin) {
        try {
            const hashedPassword = await generateHashedPassword(username, password);
            console.log(hashedPassword);
            const result = await pool.query('INSERT INTO users (username, password, is_admin, creation_date) VALUES ($1, $2, $3, $4)', [username, hashedPassword, isAdmin, creationDate]);
            return result.rowCount > 0;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async authenticateUser(username, password) {
        try {
            const result = await pool.query('SELECT password FROM users WHERE username = $1', [username]);
            if (result.rowCount === 0) {
                return false;
            }
            const pw = result.rows[0].password;
            return await validateUserCredentials(username, password, pw);
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async changePassword(username, oldPassword, newPassword) {
        try {
            const user = await this.findUser(username);
            if (user && await validateUserCredentials(username, oldPassword, user.password)) {
                const newHashedPW = generateHashedPassword(username, newPassword);
                const result = await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPW, old_row['id']]);
                return result.rowCount > 0;
            } else {
                return false;
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    async removeUser(username) {
        try {
            const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);
            return result.rowCount > 0;
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
};

async function validateUserCredentials(username, password, storedPassword) {
    try {
        console.log(username, password, storedPassword);
        // Generate the hashed password using the provided username and password
        const passToEncrypt = username + password;
        const isPasswordValid = await bcrypt.compareSync(passToEncrypt, storedPassword);

        return isPasswordValid;
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        throw new Error('User credential validation failed');
    }
}

async function generateHashedPassword(username, password) {
    const saltRounds = 10;
    const passToEncrypt = username + password;
    // Generate a salt and hash the password
    const salt = await bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hashSync(passToEncrypt, salt);

    return hashedPassword;
}

module.exports = User;
