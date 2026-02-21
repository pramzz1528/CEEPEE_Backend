// Using global fetch available in Node.js v18+

const BASE_URL = 'http://localhost:5000/api/auth';

async function testRegistration(username, password, description) {
    console.log(`\nTesting: ${description}`);
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, data);
        return { status: response.status, data };
    } catch (error) {
        console.error('Error:', error.message);
        return { error };
    }
}


async function testLogin(username, password, description) {
    console.log(`\nTesting Login: ${description}`);
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, data);
        return { status: response.status, data };
    } catch (error) {
        console.error('Error:', error.message);
        return { error };
    }
}

async function runTests() {
    const timestamp = Date.now();
    const validUser = `valid_user_${timestamp}`;

    // 1. Valid registration (Control)
    await testRegistration(validUser, 'password123', 'Valid registration');

    // 2. Invalid registration (Space in password)
    await testRegistration(`space_user_${timestamp}`, 'pass word', 'Registration with space in password');

    // 3. Valid Login
    await testLogin(validUser, 'password123', 'Valid login');

    // 4. Invalid Login (Space in password) should be 400 (Validation) or 401 (Wrong password)
    // Since we added validation, we expect 400.
    await testLogin(validUser, 'pass word', 'Login with space in password');
}

runTests();
