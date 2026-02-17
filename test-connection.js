const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET',
};

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

req.end();

// Test Login
const loginData = JSON.stringify({
    username: 'test',
    password: 'password'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const loginReq = http.request(loginOptions, (res) => {
    console.log(`LOGIN STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`LOGIN BODY: ${chunk}`);
    });
});

loginReq.on('error', (e) => {
    console.error(`problem with login request: ${e.message}`);
});

loginReq.write(loginData);
loginReq.end();
