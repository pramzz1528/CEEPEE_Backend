// using native fetch

// If node-fetch is not available, we can use built-in http/https or just assume Node 18+ valid
// Let's assume Node 18+ which has global fetch.

async function testAuth() {
    const BASE_URL = 'http://localhost:5000/api/auth';
    const testUser = {
        username: 'test_user_' + Date.now(),
        password: 'testpassword123'
    };

    console.log('--- Starting Auth Test ---');
    console.log(`Targeting: ${BASE_URL}`);
    console.log(`Test User: ${testUser.username}`);

    try {
        // 1. Test Registration
        console.log('\n1. Testing Registration...');
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();
        console.log(`Status: ${regRes.status}`);
        console.log('Response:', regData);

        if (regRes.status !== 201) {
            console.error('❌ Registration Failed');
            return;
        }
        console.log('✅ Registration Successful');

        // 2. Test Login
        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const loginData = await loginRes.json();
        console.log(`Status: ${loginRes.status}`);
        console.log('Response:', loginData);

        if (loginRes.status !== 200) {
            console.error('❌ Login Failed');
            return;
        }
        console.log('✅ Login Successful');

    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

testAuth();
