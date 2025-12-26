import { neon, neonConfig } from '@neondatabase/serverless';

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Create a SQL query helper using Neon serverless driver
export function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return neon(process.env.DATABASE_URL);
}

// Type-safe query helper with error handling
export async function query<T = Record<string, unknown>>(
    sqlQuery: TemplateStringsArray,
    ...values: unknown[]
): Promise<T[]> {
    const sql = getDb();
    try {
        const result = await sql(sqlQuery, ...values);
        return result as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper for single row queries
export async function queryOne<T = Record<string, unknown>>(
    sqlQuery: TemplateStringsArray,
    ...values: unknown[]
): Promise<T | null> {
    const results = await query<T>(sqlQuery, ...values);
    return results[0] || null;
}

// Raw SQL execution for complex queries
export async function executeRaw(queryString: string, params?: unknown[]): Promise<unknown[]> {
    const sql = getDb();
    try {
        if (params && params.length > 0) {
            // For parameterized queries
            const result = await (sql as any)(queryString, params);
            return result as unknown[];
        }
        // For simple queries without parameters
        const result = await (sql as any)(queryString);
        return result as unknown[];
    } catch (error) {
        console.error('Raw SQL execution error:', error);
        throw error;
    }
}

// Export a pre-configured SQL instance for direct use
export const sql = getDb;
