import { PrismaClient } from './generated/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'ws';

// Configure Neon for Prisma adapter
neonConfig.webSocketConstructor = WebSocket;
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

// Global singleton pattern for Prisma
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create adapter-based client if URL is present, otherwise fallback (to avoid build crashes if env missing)
const createPrismaClient = () => {
    if (!connectionString) {
        return new PrismaClient();
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Export Neon pool for raw queries (use when you need direct SQL)
export function getNeonPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return new Pool({ connectionString: process.env.DATABASE_URL });
}
