const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function verifyModelAndVision() {
    try {
        console.log("Checking available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Found models:");
            const modelNames = data.models.map(m => m.name);
            modelNames.forEach(name => console.log(`- ${name}`));

            const has25 = modelNames.some(n => n.includes('gemini-2.5-flash'));
            console.log(`\nIs gemini-2.5-flash available? ${has25 ? 'YES' : 'NO'}`);
        } else {
            console.warn("Could not list models. Response:", JSON.stringify(data));
        }

        // Test generation with a safe model
        const modelToTest = "gemini-2.5-flash"; // I'll assume it exists based on search, but verify in output
        console.log(`\nTesting text generation with: ${modelToTest}`);
        const model = genAI.getGenerativeModel({ model: modelToTest });
        const result = await model.generateContent("Hello, are you Gemini 2.5 Flash?");
        console.log("Response:", result.response.text());

    } catch (error) {
        console.error("Verification failed:", error.message);
        if (error.response) console.error("Details:", error.response.data);
    }
}

verifyModelAndVision();
