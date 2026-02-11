
const { generateText } = require('./services/googleAIService');
require('dotenv').config();

// Mock Data
const MOCK_ROOM = { name: "Modern Living Room" };
const MOCK_MATERIAL = {
    name: "Red Ceramic",
    type: "Tile",
    finish: "Glossy",
    colorFamily: "Red",
    brightness: "Medium"
};

async function testCheckMatch() {
    console.log("--- Testing Check Match Logic ---");

    // We are simulating the logic inside the route handler since we can't easily mock DB here
    // But we can verify the prompt generation and AI response.

    const prompt = `
        Acting as a professional interior designer, evaluate the compatibility of the following tile for the specified room.
        
        Room: ${MOCK_ROOM.name}
        
        Selected Tile Details:
        - Name: ${MOCK_MATERIAL.name}
        - Type: ${MOCK_MATERIAL.type}
        - Finish: ${MOCK_MATERIAL.finish}
        - Color: ${MOCK_MATERIAL.colorFamily}
        - Brightness: ${MOCK_MATERIAL.brightness}
        
        Question: Will this tile look good in this room?
        Provide a brief, helpful advice (max 2-3 sentences). Mention why it fits or suggest a caution if it might clash (e.g., slip risk for glossy floors in wet areas, or dark colors making small rooms smaller).
        `;

    try {
        console.log("Sending Prompt:", prompt);
        const advice = await generateText(prompt);
        console.log("\n✅ AI Advice Received:");
        console.log(advice);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testCheckMatch();
