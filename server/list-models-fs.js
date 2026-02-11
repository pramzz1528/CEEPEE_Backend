
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        let output = "--- Available Models ---\n";
        if (response.data && response.data.models) {
            response.data.models.forEach(m => {
                output += `${m.name} | Methods: ${m.supportedGenerationMethods.join(', ')}\n`;
            });
        }

        fs.writeFileSync('models_list_full.txt', output);
        console.log("Written to models_list_full.txt");

    } catch (error) {
        console.error("Error:", error.message);
        fs.writeFileSync('models_list_full.txt', "Error: " + error.message);
    }
}

listModels();
