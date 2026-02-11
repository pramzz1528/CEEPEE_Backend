const { visualizeTiles, generateTileSuggestion } = require('../services/googleAIService');

const visualizeTile = async (req, res) => {
    try {
        console.log('[Visualizer] Request received');

        // Validation: Ensure both files are present
        if (!req.files || !req.files['room'] || !req.files['tile']) {
            console.error('[Visualizer] Missing files');
            return res.status(400).json({ error: 'Both "room" and "tile" images are required.' });
        }

        const roomFile = req.files['room'][0];
        const tileFile = req.files['tile'][0];

        console.log(`[Visualizer] Processing: Room (${roomFile.size} bytes), Tile (${tileFile.size} bytes)`);

        // Parallel Execution: Run visualization only
        // This is important because image gen can be slow, but text is fast.
        const [visualizationData] = await Promise.all([
            visualizeTiles(
                roomFile.buffer,
                tileFile.buffer,
                roomFile.mimetype,
                tileFile.mimetype
            )
        ]);

        res.json({
            success: true,
            imageUrl: visualizationData
            // suggestion removed
        });

    } catch (error) {
        console.error('Visualizer Controller Error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to visualize tiles.' });
    }
};

module.exports = { visualizeTile };
