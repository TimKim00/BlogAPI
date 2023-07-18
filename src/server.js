const express = require('express');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const accessRoutes = require('./routes/access');
const searchRoutes = require('./routes/search');
const Utils = require('./utils/utils');

const app = express();
// Use express.json() middleware
app.use(express.json());

// Connect to the database.
require('./config/db');

// Use the auth routes.
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/access', accessRoutes);
app.use('/search', searchRoutes);

// Start the server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
