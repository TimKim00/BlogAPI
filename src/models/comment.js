const pool = require('../config/db');

const Comment = {
    /* Define methods for creating, removing, updating, and retreiving the comment. */

    // async createComment(postId, owner_id, content, creationDate) {
    //     const result = await pool.query('INSERT INTO comments (owner_id, title, content, creation_date, edit_date, removed) VALUES ($1, $2, $3, $4, $4, false) RETURNING *', [ownerId, title, content, creationDate]);
    //     return result.rowCount > 0 ? result.rows[0] : null;
    // },

    // async removePost(postId) {
    //     const result = await pool.query('UPDATE posts SET removed = true WHERE id = $1', [postId]);
    //     return result.rowCount > 0;
    // },

    // async updatePost(postId, title, content, updateDate) {
    //     const existingData = await pool.query('SELECT title, content FROM posts WHERE id = $1', [postId]);
    //     if (existingData.rowCount === 0) {
    //         return null;
    //     }
    //     if (existingData.rows[0].title === title && existingData.rows[0].content === content) {
    //         // No update is needed. Return the existing content. 
    //         return existingData.rows[0];
    //     }
    //     const result = await pool.query('UPDATE posts SET title = $1, content = $2, edit_date = $3 WHERE id = $4 RETURNING *', [title, content, updateDate, postId]);
    //     return result.rowCount > 0 ? result.rows[0] : null;
    // },

    // async readPost(postId) {
    //     const result = await pool.query('SELECT title, content FROM posts WHERE id = $1', [postId]);
    //     return result.rowCount > 0 ? result.rows[0] : null;
    // },

    // async findPost(ownerId, title) {
    //     const result = await pool.query('SELECT * FROM posts WHERE id = $1 AND title = $2', [ownerId, title]);
    //     return result.rowCount > 0? result.rows[0] : null;
    // }
}

module.exports = Post;