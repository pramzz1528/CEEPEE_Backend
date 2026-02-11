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

    let validGoogleKey = null;
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('sk-')) {
        validGoogleKey = process.env.GEMINI_API_KEY;
    } else if (apiKey && !apiKey.startsWith('sk-')) {
        validGoogleKey = apiKey;
    }

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
    let validGoogleKey = null;
    if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('sk-')) {
        validGoogleKey = process.env.GEMINI_API_KEY;
    } else if (apiKey && !apiKey.startsWith('sk-')) {
        validGoogleKey = apiKey;
    }

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
    // 1. Get API Key (Prefer specialized key, fallback to general key)
    const apiKey = process.env.GEMINI_FLASH_25_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('AI API Key is not configured (GEMINI_FLASH_25_KEY or GEMINI_API_KEY)');
    }

    // 2. Define Models to Try (Priority Order)
    const modelsToTry = [
        "gemini-2.5-flash-image",
        "gemini-2.0-flash-exp-image-generation",
        "gemini-2.0-flash-exp"
    ];

    // Helper to try a model
    const tryModel = async (modelName) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const prompt = `
        ACT AS AN EXPERT ARCHITECTURAL VISUALIZER.

        INPUTS:
        - Image 1: "Room" (Existing interior).
        - Image 2: "Material" (Tile/Flooring texture).

        YOUR TASK:
        Generate a high-fidelity photorealistic rendering of the "Room" with the "Material" applied to the floor.

        STRICT RULES:
        1. **FLOOR DETECTION**: Identify the floor area accurately. Do NOT paint over furniture, rugs, wall baseboards, or people.
        2. **PERSPECTIVE MAPPING**: processing the "Material" texture. You MUST align the texture's perspective to match the room's vanishing points. The floor tiles must look like they physically exist in that 3D space.
        3. **SCALE**: Ensure the tile size is realistic for the room size (e.g., standard 60x60cm or marble slab scale).
        4. **LIGHTING & SHADOWS**: CRITICAL. You must Preserve the original lighting interaction. The new floor must show the same shadows cast by furniture and the same reflections from windows/lights as the original floor.
        5. **REALISM**: The result must be indistinguishable from a real photo. Blending must be seamless.

        OUTPUT:
        - Return ONLY the generated image.
        - **IMPORTANT**: The output image MUST have the EXACT SAME aspect ratio and dimensions as the input "Room" image. Do NOT crop, trim, or resize the image. Only replace the floor texture.
        `;

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: roomMime, data: roomBuffer.toString('base64') } },
                    { inlineData: { mimeType: tileMime, data: tileBuffer.toString('base64') } }
                ]
            }]
        };

        console.log(`[Service] Trying visualization with model: ${modelName}`);
        return await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
    };

    // 3. Loop through models
    let lastError = null;
    for (const model of modelsToTry) {
        try {
            const response = await tryModel(model);

            const candidate = response.data.candidates?.[0];
            if (!candidate) continue; // Try next value

            // Extract Image
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
            // If we got text instead of image, log it and try next model
            const textPart = candidate.content.parts.find(p => p.text);
            if (textPart) {
                console.warn(`[Service] ${model} returned text instead of image:`, textPart.text.substring(0, 50) + "...");
            }

        } catch (error) {
            console.warn(`[Service] Model ${model} failed:`, error.response?.data?.error?.message || error.message);
            lastError = error;
            // Continue to next model
            if (error.response?.status === 401 || error.response?.status === 403) {
                // If key is invalid, no point trying other models with same key
                throw new Error("Invalid API Key");
            }
        }
    }

    // 4. If all failed
    throw new Error('Failed to visualize tiles with all available AI models. ' + (lastError?.message || ''));
};

const generateTileSuggestion = async (roomBuffer, tileBuffer, roomMime, tileMime) => {
    // We check if GEMINI_API_KEY is available as preferred fallback for text
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_FLASH_25_KEY;

    // Model: gemini-1.5-flash is good for value/speed. 
    // Using a safe fallback model name.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
