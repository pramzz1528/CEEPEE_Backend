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
    fs.appendFileSync('verification_results_1_5.txt', msg + '\n');
}

async function testModel(modelName, mode, buffer) {
    log(`\nTesting ${modelName} in mode: ${mode}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt;
        // ... (rest of prompt logic same as before but use log instead of console.log)
        if (mode === 'image-to-text') {
            const imagePart = {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: "image/png",
                },
            };
            prompt = ["Describe this image briefly.", imagePart];
        } else if (mode === 'text-to-image') {
            prompt = "Generate an image of a red circle.";
            // Note: gemini-1.5-flash does NOT support image generation. This should fail or return text.
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (response.candidates && response.candidates.length > 0) {
            const parts = response.candidates[0].content.parts;
            if (parts.length > 0) {
                if (parts[0].text) {
                    log(`[${modelName}] Success (Text Output): ${parts[0].text.substring(0, 50)}...`);
                    return 'text';
                } else if (parts[0].inlineData) {
                    log(`[${modelName}] Success (Image Output via inlineData)`);
                    return 'image';
                } else {
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
    fs.writeFileSync('verification_results_1_5.txt', ''); // Clear file
    const buffer = fs.existsSync('valid_test_image.png') ? fs.readFileSync('valid_test_image.png') : Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwITQAAAABJRU5ErkJggg==", 'base64');

    // 1. Test gemini-1.5-flash for Image-to-Text (AI Suggest) - Should work
    await testModel("gemini-1.5-flash", "image-to-text", buffer);

    // 2. Test gemini-1.5-flash for Text-to-Image (Visualize) - Should fail (return text typically)
    await testModel("gemini-1.5-flash", "text-to-image", buffer);

})();
