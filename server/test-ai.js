
const { generateImage, generateText } = require('./services/googleAIService');
require('dotenv').config();
const axios = require('axios');

async function testAI() {
    console.log('Testing Google AI Service...');
    const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;
    console.log('API Key configured:', apiKey ? 'YES (Length: ' + apiKey.length + ')' : 'NO');

    // 1. Test Text Generation (should work if key is valid)
    try {
        console.log('\n--- Testing Text Generation (Gemini 2.5/1.5 Flash) ---');
        const textResult = await generateText('Hello, are you working?');
        console.log('SUCCESS: Text generated:', textResult.substring(0, 50) + '...');
    } catch (error) {
        console.error('FAILURE: Text Generation:', error.message);
    }

    // 2. Test Image Generation (The reported issue)
    try {
        console.log('\n--- Testing Image Generation (Gemini 2.5 Flash Image) ---');
        console.log('Asking for: A cute robot');
        const imageResult = await generateImage('A cute robot');
        console.log('SUCCESS: Image generated successfully!');
        console.log('Result type: ' + (typeof imageResult));
        console.log('Result length: ' + imageResult.length);
        console.log('Result snippet: ' + imageResult.substring(0, 30) + '...');
    } catch (error) {
        console.error('FAILURE: Image Generation Error');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data || {}, null, 2));
        }
    }

    console.log('\n--- Test Complete ---');
}

testAI();
