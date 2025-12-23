
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
neonConfig.webSocketConstructor = WebSocket;

async function testUpsert() {
    console.log('Testing User Upsert...');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    const testId = 'test-user-id-' + Date.now();

    try {
        console.log(`Upserting user with ID: ${testId}`);
        const user = await prisma.user.upsert({
            where: { id: testId },
            update: {},
            create: {
                id: testId,
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                hasUsedDemo: true
            }
        });
        console.log('Upsert successful:', user.id);

        // Cleanup
        await prisma.user.delete({ where: { id: testId } });
        console.log('Cleanup successful.');
    } catch (error: any) {
        console.error('Upsert failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testUpsert();
