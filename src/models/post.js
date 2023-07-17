const pool = require('../config/db');

const Post = {
    /* Define methods for creating, removing, updating, and reading the post.
       Also, have methods to manage posts to implement the search features. */

    async createPost(ownerId, title, content, creationDate) {
        const result = await pool.query(
            'INSERT INTO posts (owner_id, title, content, creation_date,'
                + 'edit_date, removed) VALUES ($1, $2, $3, $4, $4, false) '
                + 'RETURNING *', [ownerId, title, content, creationDate]);
        return result.rowCount > 0 ? postFilter(result.rows[0]) : null;
    },

    async removePost(postId) {
        const result = await pool.query('UPDATE posts SET removed = true '
        + 'WHERE id = $1', [postId]);
        return result.rowCount > 0;
    },

    async updatePost(postId, title, content, updateDate) {
        const existingData = await pool.query('SELECT title,'
         + 'content FROM posts WHERE id = $1 AND removed = false', [postId]);
        if (existingData.rowCount === 0) {
            return null;
        }
        if (existingData.rows[0].title === title && existingData.rows[0].content === content) {
            // No update is needed. Return the existing content. 
            return postFilter(existingData.rows[0]);
        }
        const result = await pool.query('UPDATE posts SET title = $1, '
         + 'content = $2, edit_date = $3 WHERE id = $4 RETURNING *',
          [title, content, updateDate, postId]);
        return result.rowCount > 0 ? postFilter(result.rows[0]) : null;
    },

    async findPost(postId) {
        const result = await pool.query('SELECT * FROM posts WHERE '
         + 'id = $1 AND removed = false', [postId]);
        return result.rowCount > 0 ? postFilter(result.rows[0]) : null;
    },

    async findPostByTitle(ownerId, title) {
        const result = await pool.query('SELECT * FROM posts '
         + 'WHERE owner_id = $1 AND title = $2 AND removed = false', [ownerId, title]);
        return result.rowCount > 0? postFilter(result.rows[0]) : null;
    },

    async userHasAccess(ownerId, postId) {
        const postInfo = await pool.query('SELECT owner_id FROM posts '
        + 'WHERE id = $1', [postId]);
        if (postInfo && postInfo.rows[0].owner_id === ownerId) {
            return true;
        }
        return false;
    },

    async sharePost(postId, invitees) {
        const values = [];
        const text = [];
        for(let i = 0; i < invitees.length; i++) {
            text.push(`($${2*i+1}, $${2*i+2})`);
            values.push(Number(postId), invitees[i]);
        }

        const query = `INSERT INTO invites (post_id, user_id) VALUES ${text.join(", ")} ON CONFLICT (post_id, user_id) DO NOTHING RETURNING *`;
        
        const result = await pool.query(query, values);
        const ret = result.rows.map(accessFilter);
        return result.rowCount > 0 ? ret : null;
    },

    async revokeInvites(postId, revokeList) {
        const result = await pool.query('DELETE FROM invites WHERE '
         + 'post_id = $1 AND user_id = ANY($2::int[]) RETURNING *'
         , [postId, revokeList]);

        const ret = result.rows.map(accessFilter);
        return result.rowCount > 0 ? ret : null;
    }
}

function postFilter(postInfo) {
    return {
        postId: postInfo.id,
        ownerId: postInfo.owner_id,
        title: postInfo.title,
        content: postInfo.content,
        creationDate: postInfo.creation_date,
        updateDate: postInfo.edit_date,
        removed: postInfo.removed
    };
}

function accessFilter(accessInfo) {
    return {
        postId: accessInfo.post_id,
        userId: accessInfo.user_id
    };
}

module.exports = Post;