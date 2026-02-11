const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String, // Storing plain text as requested (NOT SECURE)
        required: true,
        minlength: 6
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
