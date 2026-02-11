
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testFlashImage() {
    try {
        console.log("Testing gemini-2.5-flash-image...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

        const prompt = "Draw a cute robot holding a banana";
        console.log(`Prompt: ${prompt}`);

        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log("Response received.");
        // Inspect candidates
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            console.log("Candidate Content Parts:", JSON.stringify(candidate.content.parts, null, 2));

            // Check for images
            // Sometimes it's in relevant types or we need to access it differently?
            // If it's pure image model, it might return parts with inlineData or fileData?
        } else {
            console.log("No candidates.");
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error("Details:", JSON.stringify(error.response, null, 2));
    }
}

testFlashImage();
