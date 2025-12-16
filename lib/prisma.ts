import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon for Prisma adapter (optional, for edge runtime)
neonConfig.fetchConnectionCache = true;

// Global singleton pattern for Prisma
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create Prisma client with Neon connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

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
