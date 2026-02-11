const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Tile', 'Marble'], required: true },
    textureUrl: { type: String, required: true }, // path to image
    colorFamily: { type: String, required: true }, // e.g., 'Beige', 'White', 'Black', 'Grey', 'Brown'
    finish: { type: String, enum: ['Glossy', 'Matte'], required: true },
    size: { type: String, required: true }, // e.g., '60x60cm'
    brightness: { type: String, enum: ['Light', 'Medium', 'Dark'], required: true } // Added for contrast logic
});

module.exports = mongoose.model('Material', MaterialSchema);
