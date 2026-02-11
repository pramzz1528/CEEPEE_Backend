const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// Database Connection
mongoose.connect(process.env.MONGO_URI)

    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const apiRoutes = require('./routes/api');
const visualizerRoutes = require('./routes/visualizerRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api', apiRoutes);
app.use('/api', visualizerRoutes);
app.use('/api/auth', authRoutes);

// Root
app.get('/', (req, res) => {
    res.send('Viza Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
