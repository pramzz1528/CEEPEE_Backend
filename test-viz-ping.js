// Native fetch in Node 18+
async function testPing() {
    console.log("Testing /api/viz/ping...");
    try {
        const res = await fetch('http://localhost:5000/api/viz/ping');
        console.log(`GET /api/viz/ping: ${res.status}`);
        if (res.ok) {
            const text = await res.text();
            console.log(`Response: ${text}`);
        } else {
            console.error("Ping failed!");
        }
    } catch (e) {
        console.error("Connection failed:", e.message);
    }

    console.log("\nTesting /api/viz/visualize-tiles (POST)...");
    try {
        const res = await fetch('http://localhost:5000/api/viz/visualize-tiles', { method: 'POST' });
        console.log(`POST /api/viz/visualize-tiles: ${res.status}`);
    } catch (e) {
        console.error("Connection failed for tiles:", e.message);
    }
}

testPing();
