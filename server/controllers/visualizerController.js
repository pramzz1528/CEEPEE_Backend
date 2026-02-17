const { visualizeTiles, generateTileSuggestion } = require('../services/googleAIService');

const axios = require('axios');

const downloadImage = async (url) => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return {
            buffer: Buffer.from(response.data),
            mimetype: response.headers['content-type']
        };
    } catch (error) {
        throw new Error(`Failed to download image from URL: ${url}`);
    }
};

const visualizeTile = async (req, res) => {
    try {
        console.log('[Visualizer] Request received');

        let roomBuffer, roomMime, tileBuffer, tileMime;

        // Initialize empty files if undefined
        const files = req.files || {};
        const body = req.body || {};

        console.log(`[VisualizerDebug] Files: ${Object.keys(files).join(',')}`);
        console.log(`[VisualizerDebug] Body keys: ${Object.keys(body).join(',')}`);
        if (body.roomUrl) console.log(`[VisualizerDebug] roomUrl: ${body.roomUrl}`);
        if (body.tileUrl) console.log(`[VisualizerDebug] tileUrl: ${body.tileUrl}`);

        // 1. Handle Room Image
        if (files['room'] && files['room'][0]) {
            const file = files['room'][0];
            roomBuffer = file.buffer;
            roomMime = file.mimetype;
        } else if (body.roomUrl) {
        } else if (body.roomUrl) {
            console.log(`[Visualizer] Downloading Room from URL: ${body.roomUrl}`);
            const downloaded = await downloadImage(body.roomUrl);
            roomBuffer = downloaded.buffer;
            roomMime = downloaded.mimetype;
        } else {
            return res.status(400).json({ error: 'Room image (file or url) is required.' });
        }

        // 2. Handle Tile Image
        if (files['tile'] && files['tile'][0]) {
            const file = files['tile'][0];
            tileBuffer = file.buffer;
            tileMime = file.mimetype;
        } else if (body.tileUrl) {
            console.log(`[Visualizer] Downloading Tile from URL: ${body.tileUrl}`);
            const downloaded = await downloadImage(body.tileUrl);
            tileBuffer = downloaded.buffer;
            tileMime = downloaded.mimetype;
        } else {
            return res.status(400).json({ error: 'Tile image (file or url) is required.' });
        }

        console.log(`[Visualizer] Processing: Room (${roomBuffer.length} bytes), Tile (${tileBuffer.length} bytes)`);

        // Parallel Execution: Run visualization only
        const [visualizationData] = await Promise.all([
            visualizeTiles(
                roomBuffer,
                tileBuffer,
                roomMime,
                tileMime
            )
        ]);

        res.json({
            success: true,
            imageUrl: visualizationData
        });

    } catch (error) {
        console.error('Visualizer Controller Error:', error.message);
        const fs = require('fs');
        fs.writeFileSync('debug_error.log', `[${new Date().toISOString()}] ${error.stack}\n`);
        res.status(500).json({ error: error.message || 'Failed to visualize tiles.' });
    }
};

module.exports = { visualizeTile };
