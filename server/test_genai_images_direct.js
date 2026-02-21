const { generateImage } = require('./services/googleAIService');
const fs = require('fs');

(async () => {
    try {
        console.log("Testing generateImage with gemini-2.5-flash...");
        const prompt = "A futuristic city skyline at sunset, photorealistic, 4k";
        const result = await generateImage(prompt);

        if (result && result.startsWith('data:image')) {
            console.log("SUCCESS: Image generated successfully!");
            console.log("Result length:", result.length);

            // Extract base64 and save to file for verification
            const base64Data = result.replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync('test_output_image.png', base64Data, 'base64');
            console.log("Saved test_output_image.png");
        } else {
            console.error("FAILED: Result is not a valid data URI", result ? result.substring(0, 50) : "null");
        }
    } catch (error) {
        console.error("ERROR during image generation:", error.message);
        if (error.response) {
            console.error("Response details:", JSON.stringify(error.response, null, 2));
        }
    }
})();
