
import { prisma } from './lib/prisma';

async function main() {
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name::text as name
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('Database tables:', JSON.stringify(tables, null, 2));
    } catch (error) {
        console.error('Error fetching schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
