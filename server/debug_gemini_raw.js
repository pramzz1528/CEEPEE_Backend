const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

(async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }
    console.log("Using key:", key.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        console.log("Sending prompt to gemini-2.5-flash...");
        const result = await model.generateContent("Test prompt");
        const response = await result.response;
        console.log("Response structure:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    }
})();
