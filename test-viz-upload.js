const http = require('http');

const validBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==";
const buffer = Buffer.from(validBase64, 'base64');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const postData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="room"; filename="room.jpg"',
    'Content-Type: image/jpeg',
    '',
    buffer.toString('binary'),
    `--${boundary}`,
    'Content-Disposition: form-data; name="tile"; filename="tile.jpg"',
    'Content-Type: image/jpeg',
    '',
    buffer.toString('binary'),
    `--${boundary}--`
].join('\r\n');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/viz/visualize-tiles',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postData, 'binary')
    }
};

console.log("Sending Multipart Request...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData, 'binary');
req.end();
