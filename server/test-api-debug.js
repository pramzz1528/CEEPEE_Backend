const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

const checkKey = async (keyName) => {
    const key = process.env[keyName];
    if (!key) {
        console.log(`❌ ${keyName} is MISSING`);
        return;
    }
    console.log(`✅ ${keyName} exists (starts with ${key.substring(0, 4)}...)`);

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Try to generate content with a safe model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        const text = result.response.text();
        console.log(`   ✅ Key works with gemini-1.5-flash. Response: ${text.substring(0, 20)}...`);
    } catch (e) {
        console.error(`   ❌ Key FAILED: ${e.message}`);
    }
};

(async () => {
    console.log("--- Checking API Keys ---");
    await checkKey('GEMINI_API_KEY');
    await checkKey('GEMINI_FLASH_25_KEY');

    console.log("\n--- Checking Model Names via API ---");
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_FLASH_25_KEY;
    if (key) {
        try {
            const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const models = response.data.models;
            console.log("Available Models:");
            models.forEach(m => {
                if (m.name.includes('gemini') || m.name.includes('imagen')) {
                    console.log(` - ${m.name}`);
                }
            });
        } catch (e) {
            console.log("Error listing models:", e.message);
            if (e.response) console.log("Response data:", JSON.stringify(e.response.data));
        }
    }
})();
