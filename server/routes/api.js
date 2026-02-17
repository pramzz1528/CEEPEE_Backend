const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Material = require('../models/Material');
const Room = require('../models/Room');
const { generateImage, generateText } = require('../services/googleAIService');
const multer = require('multer');
const { visualizeTile } = require('../controllers/visualizerController');

// Configure Multer for memory storage (buffer access)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
   3️⃣ AI SUGGESTIONS (MISSING ROUTE ADDED)
===================================================== */
router.post('/ai-suggest', async (req, res) => {
  try {
    const { currentMaterial, availableMaterials } = req.body;

    // Validate inputs
    if (!currentMaterial || !availableMaterials || !Array.isArray(availableMaterials)) {
      return res.json({ suggestedIds: [] }); // Fail gracefully
    }

    const prompt = `
    You are an interior design expert.
    I have a room with "${currentMaterial.name}" (${currentMaterial.colorFamily}, ${currentMaterial.finish}).
    
    From the following list of available tiles, suggest 3 that would go well with this tile for a modern look.
    Return ONLY a JSON array of their IDs.
    
    Available Tiles:
    ${JSON.stringify(availableMaterials.map(m => ({ id: m.id || m._id, name: m.name, color: m.colorFamily })))}
    `;

    const text = await generateText(prompt);

    // Extract JSON array from text
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const suggestedIds = JSON.parse(jsonMatch[0]);
      res.json({ suggestedIds });
    } else {
      res.json({ suggestedIds: [] });
    }

  } catch (error) {
    console.error("AI Suggest Error:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
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

/* =====================================================
   5️⃣ VISUALIZE TILES (CUSTOM UPLOAD)
   ===================================================== */
router.post('/visualize-tiles', upload.fields([
  { name: 'room', maxCount: 1 },
  { name: 'tile', maxCount: 1 }
]), visualizeTile);

module.exports = router;
