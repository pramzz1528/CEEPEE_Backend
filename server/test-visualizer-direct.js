const { visualizeTiles, generateTileSuggestion } = require('./services/googleAIService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testVisualizer() {
    try {
        const roomPath = path.join(__dirname, 'room.jpg');
        const tilePath = path.join(__dirname, 'tile.jpg');

        if (!fs.existsSync(roomPath) || !fs.existsSync(tilePath)) {
            console.error('Error: Please place "room.jpg" and "tile.jpg" in the server directory to run this test.');
            return;
        }

        const roomBuffer = fs.readFileSync(roomPath);
        const tileBuffer = fs.readFileSync(tilePath);

        console.log('Generating visualization...');
        const result = await visualizeTiles(roomBuffer, tileBuffer, 'image/jpeg', 'image/jpeg');

        console.log('Visualization Success! Result length:', result.length);

        // Save result
        const base64Data = result.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync('output.png', base64Data, 'base64');
        console.log('Saved output to output.png');

        console.log('Generating suggestion...');
        const suggestion = await generateTileSuggestion(roomBuffer, tileBuffer, 'image/jpeg', 'image/jpeg');
        console.log('Suggestion:', suggestion);

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testVisualizer();
