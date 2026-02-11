
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        console.log("--- Available Models ---");
        if (response.data && response.data.models) {
            response.data.models.forEach(m => {
                // Filter for likely candidates to keep output short
                if (m.name.includes('gemini') || m.name.includes('imagen')) {
                    console.log(`${m.name} | Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("No models found in response.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error("Status:", error.response.status);
    }
}

listModels();
