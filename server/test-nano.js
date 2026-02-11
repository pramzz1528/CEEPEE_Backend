
const { generateText } = require('./services/googleAIService');
require('dotenv').config();

async function testNano() {
    console.log("--- Testing Nano Banana API ---");
    const prompt = "Hello! Are you the Nano Banana model? Reply with a short fun banana fact.";

    try {
        console.log("Sending Prompt...");
        const response = await generateText(prompt);
        console.log("\n✅ Response Received:");
        console.log(response);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testNano();
