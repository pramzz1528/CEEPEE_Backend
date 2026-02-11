const express = require('express');
const router = express.Router();
const multer = require('multer');
const { visualizeTile } = require('../controllers/visualizerController');

// Configure Multer for memory storage (buffer access)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// Route: POST /visualize-tiles
// Expects form-data with 'room' and 'tile' fields
router.post('/visualize-tiles', upload.fields([
    { name: 'room', maxCount: 1 },
    { name: 'tile', maxCount: 1 }
]), visualizeTile);

module.exports = router;
