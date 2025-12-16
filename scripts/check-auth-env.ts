// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL'
];

console.log("Checking Environment Variables for Auth...");
const missing = [];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ Missing: ${key}`);
        missing.push(key);
    } else {
        // Print non-sensitive values
        if (key === 'NEXTAUTH_URL') console.log(`✅ ${key}: ${process.env[key]}`);
        else console.log(`✅ ${key}: [Set]`);
    }
}

if (missing.length > 0) {
    console.error("\nCRITCAL: Missing required env vars for Google OAuth.");
} else {
    console.log("\nEnvironment looks correct. Ensure Google Cloud Console has valid Redirect URI.");
}
