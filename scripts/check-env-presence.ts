
import dotenv from 'dotenv';
dotenv.config();

const keysToCheck = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'GITHUB_TOKEN',
    'LLM_PROVIDER',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'ENCRYPTION_KEY',
    'LEMON_SQUEEZY_API_KEY',
    'LEMON_SQUEEZY_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'SERPER_API_KEY'
];

console.log("Environment Variable Presence Check:");
console.log("------------------------------------");

keysToCheck.forEach(key => {
    const value = process.env[key];
    if (value) {
        console.log(`[OK] ${key} is present`);
    } else {
        console.log(`[MISSING] ${key}`);
    }
});
