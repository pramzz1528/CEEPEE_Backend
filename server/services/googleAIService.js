const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("[Service] GEMINI_API_KEY not found in environment.");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates text using Gemini 2.5 Flash.
 */
const generateText = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('[Service] Text Generation Error:', error.message);
        throw error;
    }
};

/**
 * Generates an image based on a prompt (using vision capabilities of Gemini).
 */
const generateImage = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                const imagePart = candidate.content.parts.find(part => part.inlineData);
                if (imagePart && imagePart.inlineData) {
                    const mimeType = imagePart.inlineData.mimeType || 'image/png';
                    const base64Image = imagePart.inlineData.data;
                    return `data:${mimeType};base64,${base64Image}`;
                }
            }
        }
        throw new Error('No image data found in Gemini response');
    } catch (error) {
        console.error('[Service] Image Generation Error:', error.message);
        throw error;
    }
};

/**
 * Matches a room and tile based on a user prompt.
 */
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

/**
 * Core visualization function: replaces floor in room image with tile texture.
 */
const visualizeTiles = async (roomBuffer, tileBuffer, roomMime, tileMime) => {
    try {
        // Use gemini-2.5-flash-image for specialized vision support
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
        console.log(`[Service] Performing visualization with model: gemini-2.5-flash-image.`);

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
        7. **The generated image should be as the original the height and width should be same as the original image.**
        `;

        const imageParts = [
            { inlineData: { data: roomBuffer.toString("base64"), mimeType: roomMime } },
            { inlineData: { data: tileBuffer.toString("base64"), mimeType: tileMime } }
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                const parts = candidate.content.parts;
                const imagePart = parts.find(part => part.inlineData);
                if (imagePart && imagePart.inlineData) {
                    console.log("[Service] Image generated successfully.");
                    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                }

                const textPart = parts.find(part => part.text);
                if (textPart) {
                    console.log(`[Service] AI returned text description: ${textPart.text.substring(0, 100)}...`);
                    throw new Error(`AI returned text instead of image: ${textPart.text.substring(0, 50)}`);
                }
            }
        }

        if (response.promptFeedback?.blockReason) {
            throw new Error(`Model blocked request: ${response.promptFeedback.blockReason}`);
        }

        console.log("[Service] Full Response Dump for Debug:", JSON.stringify(response, null, 2));
        throw new Error("Model failed to return image data (no candidate parts found).");

    } catch (error) {
        console.error(`[Service] Visualization failed: ${error.message}`);
        throw new Error(`Failed to visualize tiles: ${error.message}`);
    }
};

/**
 * Analyzes room and tile compatibility.
 */
const generateTileSuggestion = async (roomBuffer, tileBuffer, roomMime, tileMime) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        You are a sarcastic high-end interior designer.
        Analyze these two images (Room and Tile).
        Does the floor tile match the room's style?
        
        OUTPUT: A single, definitive sentence. 
        Keep it under 15 words. Be bold.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: roomBuffer.toString('base64'), mimeType: roomMime } },
            { inlineData: { data: tileBuffer.toString('base64'), mimeType: tileMime } }
        ]);

        return result.response.text() || "No suggestion available.";
    } catch (error) {
        console.warn("[Service] Suggestion failed:", error.message);
        return "Could not generate suggestion at this time.";
    }
};

module.exports = { generateImage, generateText, matchRoomAndTile, visualizeTiles, generateTileSuggestion };
