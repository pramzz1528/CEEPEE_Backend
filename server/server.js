const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Database Connection
// Database Connection
mongoose.connect(process.env.MONGO_URI)

    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const apiRoutes = require('./routes/api');
const visualizerRoutes = require('./routes/visualizerRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/viz', visualizerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Root
app.get('/', (req, res) => {
    res.send('Viza Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Print all registered routes
    const listRoutes = (stack, parent = "") => {
        stack.forEach(middleware => {
            if (middleware.route) { // routes registered directly on the app
                const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
                console.log(`ROUTE: ${methods} ${parent}${middleware.route.path}`);
            } else if (middleware.name === 'router') { // router middleware 
                // Creating the full path is tricky with Express internals, but usually strictly handled by regex
                // Simplified view:
                let pathPrefix = "";
                if (middleware.regexp) {
                    const str = middleware.regexp.toString();
                    // Clean up regex string to find path prefix (basic attempt)
                    const match = str.match(/^\/\^\\(\/.*)\\/);
                    if (match) pathPrefix = match[1].replace(/\\\//g, '/').replace('\/?(?=\/|$)', '');
                }
                listRoutes(middleware.handle.stack, parent + pathPrefix);
            }
        });
    };

    // Slight delay to ensure all routes mounted
    setTimeout(() => {
        console.log("---- REGISTERED ROUTES ----");
        if (app._router) listRoutes(app._router.stack);
        console.log("---------------------------");
    }, 1000);
});
