// Native fetch in Node 18+
// Node 18+ has native fetch.

async function testEndpoint() {
    try {
        console.log("Testing connectivity to http://localhost:5000/api/visualize-tiles...");
        // Just send a GET to check 404 vs 405 (Method Not Allowed) since it's a POST route
        const response = await fetch('http://localhost:5000/api/visualize-tiles', {
            method: 'GET'
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        if (response.status === 404) {
            console.error("Endpoint NOT FOUND (404)");
        } else if (response.status === 405 || response.status === 500 || response.status === 400) {
            console.log("Endpoint Exists (Method/Input Error as expected for GET)");
        }
    } catch (error) {
        console.error("Connection Failed:", error.message);
    }
}

testEndpoint();
