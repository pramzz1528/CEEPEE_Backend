const { visualizeTiles } = require('./services/googleAIService');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

(async () => {
    try {
        console.log("Testing visualizeTiles with gemini-2.5-flash-image...");

        let roomBuffer, tileBuffer;

        const testImagePath = path.join(__dirname, 'valid_test_image.png');
        if (fs.existsSync(testImagePath)) {
            console.log("Using valid_test_image.png for test");
            roomBuffer = fs.readFileSync(testImagePath);
            tileBuffer = fs.readFileSync(testImagePath);
        } else {
            console.log("Creating valid dummy 1x1 pixel PNG buffers");
            const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwITQAAAABJRU5ErkJggg==";
            roomBuffer = Buffer.from(b64, 'base64');
            tileBuffer = Buffer.from(b64, 'base64');
        }

        const result = await visualizeTiles(roomBuffer, tileBuffer, "image/png", "image/png");

        if (result && result.startsWith('data:image')) {
            console.log("SUCCESS: Image generated successfully!");
            console.log("Result length:", result.length);

            // Extract base64 and save to file for verification
            const base64Data = result.replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync('test_visualize_output.png', base64Data, 'base64');
            console.log("Saved test_visualize_output.png");
        } else {
            console.error("FAILED: Result is not a valid data URI", result ? result.substring(0, 50) : "null");
        }
    } catch (error) {
        console.error("ERROR during visualizeTiles:", error.message);
        const fs = require('fs');
        fs.writeFileSync('test_error_details.txt', error.message + '\n' + (error.response ? JSON.stringify(error.response, null, 2) : ''));
    }
})();
