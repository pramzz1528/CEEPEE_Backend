const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  floorCoordinates: {
    type: [[Number]], // Array of [x, y] arrays
    required: true, // Example: [[0, 0], [100, 0], [100, 100], [0, 100]]
    validate: [arr => arr.length === 4, 'Must have exactly 4 coordinates']
  }
});

module.exports = mongoose.model('Room', RoomSchema);
