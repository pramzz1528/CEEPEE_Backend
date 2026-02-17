
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

const apiKey = process.env['GEMINI_FLASH_2.5_KEY'] || process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Listing models...");
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey
        // No, model listing is on the manager or factory?
        // Actually, it's not directly on the instance usually in the simplified SDK, but let's try accessing the list via the API directly if the SDK doesn't expose it easily in this version.
        // Wait, SDK usually has a way. 
        // But to be safe and quick, I'll use the REST API to list models.

        const axios = require('axios');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        const fs = require('fs');
        const outputParams = [];
        if (response.data && response.data.models) {
            response.data.models.forEach(m => {
                outputParams.push(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        }
        fs.writeFileSync(path.join(__dirname, 'models_output.txt'), outputParams.join('\n'));
        console.log("Written to models_output.txt");
    } catch (error) {
        console.error("Error listing models:", error.message);
        if (error.response) {
            console.error("Details:", error.response.data);
        }
    }
}

listModels();
