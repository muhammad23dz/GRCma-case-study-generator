
import 'dotenv/config';
import { prisma } from '../lib/prisma';

// Ensure SSL bypass is OFF to verify real fix
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
    console.log('Testing Configured Prisma (Adapter-based) Connection...');
    try {
        const userCount = await prisma.user.count();
        console.log(`Successfully connected via Adapter! User count: ${userCount}`);

        // Try to fetch one user
        const user = await prisma.user.findFirst();
        console.log('Sample user fetch:', user ? 'Found' : 'No users');

    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
