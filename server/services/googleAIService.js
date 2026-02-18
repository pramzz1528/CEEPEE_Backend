const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NANO_BANANA_API_KEY;

// OpenAI-compatible generic client for Nano Banana
const generateTextOpenAI = async (prompt, modelName = "nano-banana-pro-preview") => {
    // Default to OpenAI URL if NANO URL is not set, but user likely needs to set it
    const baseURL = process.env.NANO_BANANA_API_URL || "https://api.openai.com/v1";

    // Ensure clean URL construction
    const cleanBaseURL = baseURL.replace(/\/$/, '');
    const url = `${cleanBaseURL}/chat/completions`;

    try {
        console.log(`[Nano Banana] Sending request to: ${url} (Model: ${modelName})`);

        const response = await axios.post(url, {
            model: modelName,
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            throw new Error("Invalid response structure from Nano Banana API");
        }

    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error(`[Nano Banana] Error: ${errMsg}`);
        throw new Error(`Nano Banana API Failed: ${errMsg}`);
    }
};

const generateText = async (prompt) => {
    // 1. Check for Nano Banana (sk- keys)
    if (apiKey && apiKey.startsWith('sk-')) {
        console.log("[Service] Using Nano Banana API (OpenAI Compatible)...");
        try {
            return await generateTextOpenAI(prompt);
        } catch (error) {
            console.warn(`[Service] Nano Banana failed. Attempting fallback to Gemini.`);
            // Continue to fallback if possible? 
            // If the key is sk-, Gemini SDK will crash. We cannot fallback effectively unless there is a separate GEMINI_API_KEY.
            // If GEMINI_API_KEY is distinct from NANO_BANANA_API_KEY, we can try.
        }
    }

    // 2. Fallback / Primary Google Logic
    // Only use Google SDK if we have a valid Google Key (AIza...)
    // If apiKey is 'sk-', validGoogleKey will be null unless process.env.GEMINI_API_KEY is explicitly set separate.

    let validGoogleKey = process.env.GEMINI_API_KEY;

    if (!validGoogleKey) {
        // If we only have an sk- key and it failed, we must stop.
        throw new Error("Nano Banana failed and no valid Google API Key available for fallback.");
    }

    // safeGenAI instance specifically for this fallback
    const safeGenAI = new GoogleGenerativeAI(validGoogleKey);

    try {
        // Fallback 1: Gemini 2.5 Flash
        const model = safeGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (fallbackError) {
        console.warn(`[Service] Gemini 2.5 Flash failed: ${fallbackError.message}. Attempting final fallback.`);
        try {
            // Fallback 2: Gemini Flash Latest
            const model = safeGenAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (finalError) {
            console.error('[Service] Text Generation Error (All models failed):', finalError.message);
            throw finalError;
        }
    }
};

const generateImage = async (prompt) => {
    // 1. Image Generation for Nano Banana 
    if (apiKey && apiKey.startsWith('sk-')) {
        const baseURL = process.env.NANO_BANANA_API_URL || "https://api.openai.com/v1";
        const cleanBaseURL = baseURL.replace(/\/$/, '');
        const url = `${cleanBaseURL}/images/generations`;

        try {
            console.log("[Service] Using Nano Banana Image API...");
            const response = await axios.post(url, {
                model: "dall-e-3", // Assumption: standard model if OpenAI comptabile
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const b64 = response.data.data[0].b64_json;
            return `data:image/png;base64,${b64}`;
        } catch (error) {
            const errMsg = error.response?.data?.error?.message || error.message;
            console.warn(`[Service] Nano Banana Image API Failed: ${errMsg}. Falling back to Gemini.`);
        }
    }

    // 2. Google Fallback
    let validGoogleKey = process.env.GEMINI_API_KEY;

    if (!validGoogleKey) {
        throw new Error('No valid Google API Key available for image generation fallback.');
    }

    const safeGenAI = new GoogleGenerativeAI(validGoogleKey);

    try {
        const model = safeGenAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            const imagePart = candidate.content.parts.find(part => part.inlineData);

            if (imagePart && imagePart.inlineData) {
                const mimeType = imagePart.inlineData.mimeType || 'image/png';
                const base64Image = imagePart.inlineData.data;
                return `data:${mimeType};base64,${base64Image}`;
            }
        }
        throw new Error('No image data found in Gemini response');

    } catch (error) {
        console.error('[Service] Gemini Image Generation Error:', error.message);
        if (error.message.includes('429')) {
            throw new Error('Gemini Image API is busy. Please try again later.');
        }
        throw new Error('Failed to generate image with Gemini. ' + error.message);
    }
};

const matchRoomAndTile = async (prompt, rooms, materials) => {
    try {
        const roomList = rooms.map(r => `${r.id}: ${r.name}`).join('\n');
        const materialList = materials.map(m => `${m.id}: ${m.name} (${m.colorFamily}, ${m.finish})`).join('\n');

        const aiPrompt = `
        Act as an interior design AI.
        User Request: "${prompt}"

        Task: Select the best matching Room ID and Material ID from the provided lists based on the user's request.
        
        Available Rooms:
        ${roomList}

        Available Materials:
        ${materialList}

        Output Format:
        Return ONLY a JSON object with this exact structure:
        {
            "roomId": "selected_room_id",
            "materialId": "selected_material_id",
            "reasoning": "Brief explanation of why these were chosen (max 1 sentence)"
        }
        `;

        const responseText = await generateText(aiPrompt);

        const cleanJson = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('[Service] Match Error:', error);
        throw new Error('Failed to match room and tile');
    }
};

const visualizeTiles = async (roomBuffer, tileBuffer, roomMime, tileMime) => {
    // User requested "Gemini 2.5" key.
    // Switching to standard GEMINI_API_KEY as the specialized key was expired.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('AI API Key is not configured (checked GEMINI_API_KEY)');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Assuming "gemini 2.5" refers to the model associated with this key, or the latest flash.
    // Current latest is gemini-2.0-flash or gemini-1.5-flash. Users often round up or misremember numbers.
    // User requested "Gemini 2.5".
    // "gemini-2.5-flash-image" is available and likely the correct model for image generation tasks.
    // "gemini-2.0-flash-exp" involves multimodal capabilities including image reasoning/generation
    // User requested Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        console.log(`[Service] Trying visualization with model: gemini-2.5-flash (API Key: GEMINI_API_KEY).`);

        const prompt = `
        ACT AS AN EXPERT ARCHITECTURAL VISUALIZER.
        Task: COMPLETELY REPLACE the existing floor in the "Room" image with the "Material" texture provided.
        
        Strict Requirements:
        1. **High Quality & Clarity**: The final image must be crisp, sharp, and Photorealistic (4K style).
        2. **Texture Visibility**: The new material texture must be VERY CLEAR and distinct. Do NOT blur the floor.
        3. **Seamless Integration**: Respect the room's original perspective, vanishing points, and lighting.
        4. **Preserve Context**: Keep all furniture, walls, and shadows exactly as they are. Only change the floor surface.
        5. **Lighting**: Apply the room's natural lighting and shadows onto the new floor for realism.
        6. Output ONLY the final modified image.
        `;

        const imageParts = [
            {
                inlineData: {
                    data: roomBuffer.toString("base64"),
                    mimeType: roomMime
                }
            },
            {
                inlineData: {
                    data: tileBuffer.toString("base64"),
                    mimeType: tileMime
                }
            }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;

        // Check for inline image data in candidates
        const fs = require('fs');
        fs.writeFileSync('gemini_response_debug.json', JSON.stringify(response, null, 2));

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            const imagePart = candidate.content.parts.find(part => part.inlineData);

            if (imagePart && imagePart.inlineData) {
                console.log("[Service] Image generated successfully.");
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }
        }

        // Check for block reason
        if (response.promptFeedback && response.promptFeedback.blockReason) {
            throw new Error(`Model blocked request: ${response.promptFeedback.blockReason}`);
        }

        throw new Error("Model returned no image data.");

    } catch (error) {
        console.error(`[Service] Visualization failed: ${error.message}`);
        throw new Error(`Failed to visualize tiles: ${error.message}`);
    }
};

const generateTileSuggestion = async (roomBuffer, tileBuffer, roomMime, tileMime) => {
    // We check if GEMINI_API_KEY is available as preferred fallback for text
    const apiKey = process.env.GEMINI_API_KEY;

    // Model: gemini-2.5-flash is good for value/speed. 
    // Using a safe fallback model name.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
    You are a sarcastic high-end interior designer.
    Analyze these two images (Room and Tile).
    Does the floor tile match the room's style?
    
    OUTPUT: A single, definitive sentence. 
    Examples:
    "Match: The warm oak tones perfectly complement the minimal white walls."
    "Clash: This rustic stone looks chaotic in such a sleek modern kitchen."
    "Neural: It's a safe choice, but doesn't add much character."
    
    Keep it under 15 words. Be bold.
    `;

    try {
        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: roomMime, data: roomBuffer.toString('base64') } },
                    { inlineData: { mimeType: tileMime, data: tileBuffer.toString('base64') } }
                ]
            }]
        };

        const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
        return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion available.";

    } catch (error) {
        console.warn("[Service] Suggestion failed:", error.message);
        return "Could not generate suggestion at this time.";
    }
}

module.exports = { generateImage, generateText, matchRoomAndTile, visualizeTiles, generateTileSuggestion };
