
const { generateText } = require('./services/googleAIService');
require('dotenv').config();

async function testBackend() {
    console.log("--- Testing Backend Resilience ---");
    try {
        const response = await generateText("Hello world check");
        console.log("✅ Backend Active. Response:", response);
    } catch (e) {
        console.error("❌ Backend Error:", e.message);
    }
}

testBackend();
