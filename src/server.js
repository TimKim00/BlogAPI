const express = require('express');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const accessRoutes = require('./routes/access');
const searchRoutes = require('./routes/search');
const User = require('./models/user');

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

User.createDummyUser()
.catch(err => err);

// Start the server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
