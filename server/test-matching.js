
const { matchRoomAndTile } = require('./services/googleAIService');
require('dotenv').config();

// Mock Data for Testing
const MOCK_ROOMS = [
    { id: 'room_living', name: 'Modern Living Room' },
    { id: 'room_kitchen', name: 'Luxury Kitchen' },
    { id: 'room_bathroom', name: 'Spa Bathroom' }
];

const MOCK_MATERIALS = [
    { id: 'mat_marble', name: 'Carrara Marble', colorFamily: 'White', finish: 'Glossy' },
    { id: 'mat_wood', name: 'Oak Wood', colorFamily: 'Brown', finish: 'Matte' },
    { id: 'mat_slate', name: 'Black Slate', colorFamily: 'Black', finish: 'Matte' }
];

async function testMatching() {
    console.log("--- Testing AI Room & Tile Matching ---");

    const prompts = [
        "I want a white marble floor in my bathroom",
        "A cozy kitchen with wooden flooring",
        "Dark slate tiles for a living room"
    ];

    for (const prompt of prompts) {
        console.log(`\nPrompt: "${prompt}"`);
        try {
            const result = await matchRoomAndTile(prompt, MOCK_ROOMS, MOCK_MATERIALS);
            console.log("Result:", JSON.stringify(result, null, 2));

            if (result.roomId && result.materialId) {
                console.log("✅ Valid Match");
            } else {
                console.log("❌ Invalid Match Format");
            }
        } catch (error) {
            console.error("❌ Error:", error.message);
        }
    }
}

testMatching();
