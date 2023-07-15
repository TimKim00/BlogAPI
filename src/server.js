const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
// Use express.json() middleware
app.use(express.json());

// Connect to the database.
require('./config/db');

// Use the auth routes.
app.use('/auth', authRoutes);

// Start the server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
