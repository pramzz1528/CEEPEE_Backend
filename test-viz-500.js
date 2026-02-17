// Native fetch in Node 18+
// Native fetch in Node 18+
// Actually Node 18 global FormData might differ. Let's try standard.

async function testViz500() {
    console.log("Testing POST /api/viz/visualize-tiles with dummy data...");

    // Create a 1x1 pixel image
    const pixel = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";
    const buffer = Buffer.from(pixel, 'base64');

    // Construct valid multipart request manually if FormData is tricky, 
    // but usually in Node we can use a library or just send URLs.
    // Let's test the URL fallback path first as it's easier.

    try {
        const response = await fetch('http://localhost:5000/api/viz/visualize-tiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomUrl: "https://via.placeholder.com/150",
                tileUrl: "https://via.placeholder.com/150"
            })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testViz500();
