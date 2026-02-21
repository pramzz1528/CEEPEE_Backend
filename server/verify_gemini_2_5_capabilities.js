const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("API Key missing!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

function log(msg) {
    console.log(msg);
    fs.appendFileSync('verification_results.txt', msg + '\n');
}

async function testModel(modelName, mode, buffer) {
    log(`\nTesting ${modelName} in mode: ${mode}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const imagePart = {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType: "image/png",
            },
        };

        let prompt;
        if (mode === 'image-to-text') {
            prompt = ["Describe this image briefly.", imagePart];
        } else if (mode === 'image-to-image') {
            prompt = ["Change the color of this image to blue.", imagePart];
            // Note: For gemini-2.5-flash, standard generation doesn't return image parts usually.
            // But let's see if it errors out or just returns text description of changes.
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // precise logging
        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;
            if (parts.length > 0) {
                if (parts[0].text) {
                    log(`[${modelName}] Success (Text Output): ${parts[0].text.substring(0, 50)}...`);
                    return 'text';
                } else if (parts[0].inlineData) { // rare
                    log(`[${modelName}] Success (Image Output via inlineData)`);
                    return 'image';
                } else { // Check for other formats? 
                    log(`[${modelName}] Success (Unknown Output): ${JSON.stringify(parts[0])}`);
                    return 'unknown';
                }
            }
        }

        log(`[${modelName}] Response empty/different structure.`);
        return 'empty';

    } catch (error) {
        log(`[${modelName}] Failed: ${error.message}`);
        return 'error';
    }
}

(async () => {
    fs.writeFileSync('verification_results.txt', ''); // Clear file
    const buffer = fs.readFileSync('valid_test_image.png');

    // 1. Test gemini-2.5-flash for Image-to-Text (AI Suggest)
    await testModel("gemini-2.5-flash", "image-to-text", buffer);

    // 2. Test gemini-2.5-flash for Image-to-Image (Visualize)
    await testModel("gemini-2.5-flash", "image-to-image", buffer);

    // 3. Test gemini-2.0-flash for Image-to-Image (Visualize Fallback)
    await testModel("gemini-2.0-flash", "image-to-image", buffer);

    // 4. Test gemini-2.5-flash-image for Image-to-Image (Check support)
    await testModel("gemini-2.5-flash-image", "image-to-image", buffer);
})();
