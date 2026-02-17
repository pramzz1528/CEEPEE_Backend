const { visualizeTiles, generateTileSuggestion } = require('./services/googleAIService');
const fs = require('fs');
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

async function testVisualizer() {
    try {
        const roomPath = path.join(__dirname, 'room.jpg');
        const tilePath = path.join(__dirname, 'tile.jpg');

        if (!fs.existsSync(roomPath) || !fs.existsSync(tilePath)) {
            console.error('Error: Please place "room.jpg" and "tile.jpg" in the server directory to run this test.');
            return;
        }

        // Create valid 1x1 pixel JPEG (white)
        const validBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";

        const roomBuffer = Buffer.from(validBase64, 'base64');
        const tileBuffer = Buffer.from(validBase64, 'base64');

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
        fs.appendFileSync(path.join(__dirname, 'test_errors.log'), `${new Date().toISOString()} - Test Failed: ${error.message}\n`);
        console.error('Test Failed:', error.message);
    }
}

testVisualizer();
