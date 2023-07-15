/* Import a postgress pool module */
const { Pool } = require('pg');

/* Create a new pool instance with connection details */
const pool = new Pool({
    host: 'localhost',
    user: 'blog_user',
    password: 'RESTfulAPI',
    database: 'blogapi',
    post: 5432,
});

/* Export the pool instance */
module.exports = pool;