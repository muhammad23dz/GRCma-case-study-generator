
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
neonConfig.webSocketConstructor = WebSocket;

async function verifyTables() {
    console.log('Verifying Core Tables...');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    const tablesToVerify = ['systemSetting', 'organization', 'invitation', 'user'];

    try {
        for (const table of tablesToVerify) {
            // @ts-ignore
            const count = await prisma[table].count();
            console.log(`✅ Table [${table}] exists. Record count: ${count}`);
        }
        console.log('Final verification: All requested system tables are present.');
    } catch (error: any) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyTables();
