const express = require('express');
const router = express.Router();
const multer = require('multer');
const { visualizeTile } = require('../controllers/visualizerController');

console.log("[VisualizerRoutes] Router Loaded");

router.get('/ping', (req, res) => {
    res.send('Visualizer Router is working via /api/viz/ping');
});

// Configure Multer for memory storage (buffer access)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// Route: POST /visualize-tiles
// Accepts multipart/form-data. Files ('room', 'tile') and/or text fields ('roomUrl', 'tileUrl').
// Route: POST /visualize-tiles
router.post('/visualize-tiles',
    (req, res, next) => {
        console.log(`[VisualizerRoutes] POST /visualize-tiles called. Content-Length: ${req.headers['content-length']}`);
        next();
    },
    upload.fields([
        { name: 'room', maxCount: 1 },
        { name: 'tile', maxCount: 1 }
    ]),
    (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            console.error('[VisualizerRoutes] Multer Error:', err);
            return res.status(400).json({ error: `Upload Error: ${err.message}` });
        } else if (err) {
            console.error('[VisualizerRoutes] Unknown Middleware Error:', err);
            return res.status(500).json({ error: `Server Error: ${err.message}` });
        }
        next();
    },
    visualizeTile
);

module.exports = router;
