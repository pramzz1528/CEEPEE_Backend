// Native fetch in Node 18+
async function testEndpoints() {
    console.log("Testing Endpoints...");

    // 1. Test /api/viz/visualize-tiles (POST)
    try {
        const res1 = await fetch('http://localhost:5000/api/viz/visualize-tiles', { method: 'POST' });
        console.log(`POST /api/viz/visualize-tiles: ${res1.status}`);
        if (res1.status === 404) console.error("-> STILL 404!");
        else console.log("-> Endpoint Exists (200, 400, or 500 etc)");
    } catch (e) { console.error("Connection failed for tiles:", e.message); }

    // 2. Test /api/ai-suggest (POST)
    try {
        const res2 = await fetch('http://localhost:5000/api/ai-suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentMaterial: { name: "Test" }, availableMaterials: [] })
        });
        console.log(`POST /api/ai-suggest: ${res2.status}`);
        if (res2.status === 404) console.error("-> STILL 404!");
        else {
            const data = await res2.json();
            console.log("Suggest Response:", JSON.stringify(data));
        }
    } catch (e) { console.error("Connection failed for suggest:", e.message); }
}

testEndpoints();
