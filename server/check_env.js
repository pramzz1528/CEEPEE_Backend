require('dotenv').config();

console.log("Checking Environment Variables...");

const keys = [
    'GEMINI_API_KEY',
    'GEMINI_FLASH_2.5_KEY',
    'NANO_BANANA_API_KEY', // from previous file read
    'MONGO_URI'
];

keys.forEach(key => {
    if (process.env[key]) {
        console.log(`${key}: Present (Length: ${process.env[key].length})`);
        if (process.env[key].startsWith('sk-')) console.log(`  -> Starts with 'sk-'`);
        if (process.env[key].startsWith('AIza')) console.log(`  -> Starts with 'AIza'`);
    } else {
        console.log(`${key}: MISSING`);
    }
});
