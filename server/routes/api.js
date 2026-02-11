const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Material = require('../models/Material');
const Room = require('../models/Room');
const { generateImage, generateText } = require('../services/googleAIService');

/* =====================================================
   1️⃣ GET ALL PRESET ROOMS
===================================================== */
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   2️⃣ GET ALL MATERIALS (TILES)
===================================================== */
router.get('/materials', async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* =====================================================
   4️⃣ VISUALIZE TILE ON PRESET ROOM (MAIN FEATURE)
===================================================== */
router.post('/visualize', async (req, res) => {
  try {
    const { materialId, roomId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(materialId) ||
      !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }

    const material = await Material.findById(materialId);
    const room = await Room.findById(roomId);

    if (!material || !room) {
      return res.status(404).json({ error: 'Material or Room not found' });
    }

    const prompt = `
Photorealistic interior visualization.

Room:
- ${room.name}
- Size: ${room.size}
- Lighting: ${room.lighting}

Flooring:
- Apply ${material.colorFamily} ${material.finish} ${material.type}
- Tile name: ${material.name}

Requirements:
- Tile texture must be clearly visible
- Realistic shadows and lighting
- Wide angle interior shot
- Ultra realistic, 4K quality
`;

    const imageUrl = await generateImage(prompt);

    res.json({
      room: room.name,
      tile: material.name,
      imageUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Visualization failed' });
  }
});

module.exports = router;
