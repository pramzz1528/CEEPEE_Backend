const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

(async () => {
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_FLASH_25_KEY;
    if (!key) {
        fs.writeFileSync('models.json', JSON.stringify({ error: "No key" }));
        return;
    }

    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        fs.writeFileSync('models.json', JSON.stringify(response.data, null, 2));
    } catch (e) {
        fs.writeFileSync('models.json', JSON.stringify({ error: e.message, data: e.response?.data }));
    }
})();
