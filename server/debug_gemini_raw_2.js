const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

(async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    try {
        const result = await model.generateContent("Generate an image of a cat");
        const response = await result.response;

        const fs = require('fs');
        fs.writeFileSync('debug_response.json', JSON.stringify(response, null, 2));
        console.log("Written response to debug_response.json");

    } catch (error) {
        console.error("Error:", error.message);
    }
})();
