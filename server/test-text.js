const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

async function testText() {
    const apiKey = process.env.GEMINI_FLASH_25_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        console.log("Testing text generation with gemini-2.0-flash...");
        const result = await model.generateContent("Say hello!");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (error) {
        console.error("Text Gen Failed:", error.message);
    }
}

testText();
