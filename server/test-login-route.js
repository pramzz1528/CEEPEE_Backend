const axios = require('axios');

async function testLogin() {
    try {
        // Test the route that was failing (404) for the user
        const url = 'http://localhost:5000/api/login';
        console.log(`Testing POST ${url}...`);

        const response = await axios.post(url, {
            username: 'testuser',
            password: 'testpassword'
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        console.log('SUCCESS: /api/login is reachable (even if 401)');

    } catch (error) {
        if (error.response) {
            console.log('Response Status:', error.response.status);
            console.log('Response Data:', error.response.data);
            if (error.response.status === 401) {
                console.log('SUCCESS: /api/login is reachable (401 Invalid Credentials is expected)');
            } else if (error.response.status === 404) {
                console.error('FAILED: /api/login returned 404 Not Found');
            } else {
                console.log('Response:', error.response.status);
            }
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
