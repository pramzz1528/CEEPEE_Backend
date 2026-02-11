
const { generateText } = require('./services/googleAIService');
require('dotenv').config();

// Mock Data
const currentMaterial = { id: 'mat_1', name: 'Carrara Marble', colorFamily: 'White', finish: 'Glossy' };
const availableMaterials = [
    { id: 'mat_2', name: 'Black Slate', colorFamily: 'Black', finish: 'Matte' },
    { id: 'mat_3', name: 'Beige Travertine', colorFamily: 'Beige', finish: 'Matte' },
    { id: 'mat_4', name: 'Blue Ceramic', colorFamily: 'Blue', finish: 'Glossy' },
    { id: 'mat_5', name: 'Oak Wood', colorFamily: 'Brown', finish: 'Matte' }
];

async function testSuggest() {
    console.log("--- Testing AI Suggest Prompt ---");

    const optionsList = availableMaterials
        .map(m => `${m.id}: ${m.name} (${m.colorFamily}, ${m.finish})`)
        .join('\n');

    const prompt = `
      Context: You are an interior design AI assistant for a visualizer app.
      Current selection: ${currentMaterial.name} (Color: ${currentMaterial.colorFamily}, Finish: ${currentMaterial.finish}).
      
      Task: Select 3 distinct materials from the list below that would go well with the current selection.
      - Suggest one that complements (similar color/vibe).
      - Suggest one that contrasts (pop of color or different texture).
      - Suggest one that is neutral or safe.
      
      Available Materials:
      ${optionsList}
      
      Output Format:
      Return ONLY a JSON array of string IDs. Example: ["mat_1", "mat_4", "mat_5"].
      Do not explain.
    `;

    try {
        console.log("Sending Prompt...");
        const responseText = await generateText(prompt);
        console.log("--- Raw Response ---");
        console.log(responseText);
        console.log("--------------------");

        const cleanJson = responseText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        console.log("Cleaned JSON String:", cleanJson);

        try {
            const parsed = JSON.parse(cleanJson);
            console.log("✅ JSON Parsed Successfully:", parsed);
        } catch (e) {
            console.error("❌ JSON Parse Failed:", e.message);
        }

    } catch (error) {
        console.error("❌ Generation Error:", error.message);
    }
}

testSuggest();
