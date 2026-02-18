const { generateText, visualizeTiles } = require('./services/googleAIService');
const fs = require('fs');
const path = require('path');

async function testText() {
    try {
        console.log("Testing generateText...");
        const text = await generateText("Hello, are you working?");
        console.log("Text response:", text);
    } catch (error) {
        console.error("Text generation failed:", error.message);
    }
}

async function testImage() {
    // Create dummy buffers
    const buffer = Buffer.from("dummy data");
    try {
        console.log("Testing visualizeTiles (expecting failure due to dummy data but checking model access)...");
        // This acts as a probe to see if the model name is valid
        await visualizeTiles(buffer, buffer, "image/jpeg", "image/jpeg");
    } catch (error) {
        console.log("Visualization result:", error.message);
    }
}

(async () => {
    await testText();
    await testImage();
})();
