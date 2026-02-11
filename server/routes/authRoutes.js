const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login Route
router.post('/login', async (req, res) => {
    console.log('Login attempt for:', req.body.username);
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password directly (Plain text as requested - NOT SECURE)
        if (user.password !== password) {
            console.log('Invalid password for:', username);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for:', username);
        // Successful login
        // In a real app, we'd send a token. Here just success.
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register Route (For testing/setup)
router.post('/register', async (req, res) => {
    console.log('Register attempt for:', req.body.username);
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('User already exists:', username);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user (Direct password storage - NOT SECURE)
        const newUser = new User({ username, password });
        await newUser.save();

        console.log('User registered:', username);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
