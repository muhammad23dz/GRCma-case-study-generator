/**
 * Security utilities for API error handling
 * Prevents information leakage in production while maintaining full logging
 */

const isProd = process.env.NODE_ENV === 'production';

export type DeploymentErrorType =
    | 'DB_CONNECTION_FAILED'
    | 'LLM_SERVICE_UNAVAILABLE'
    | 'AUTH_CONTEXT_MISSING'
    | 'INTERNAL_ERROR'
    | 'RATE_LIMIT_EXCEEDED';

/**
 * Safe error response - returns generic message in production
 * Always logs full error server-side for debugging
 */
export function safeError(error: unknown, context?: string): { message: string; status: number; code?: DeploymentErrorType } {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Always log full error server-side
    if (context) {
        console.error(`[${context}] Error:`, error);
    } else {
        console.error('[API Error]', error);
    }

    let code: DeploymentErrorType = 'INTERNAL_ERROR';
    let status = 500;

    // Detect Infrastructure Errors
    if (errorMsg.includes('Prisma') || errorMsg.includes('database') || errorMsg.includes('connection') || errorMsg.includes('DATABASE_URL')) {
        code = 'DB_CONNECTION_FAILED';
        status = 503; // Service Unavailable
    } else if (errorMsg.includes('LLM') || errorMsg.includes('OpenAI') || errorMsg.includes('API key') || errorMsg.includes('503')) {
        code = 'LLM_SERVICE_UNAVAILABLE';
        status = 503;
    } else if (errorMsg.includes('Infrastructure')) {
        code = 'INTERNAL_ERROR';
        status = 500;
    } else if (errorMsg.includes('Unauthorized') || (errorMsg.includes('context') && !errorMsg.includes('Infrastructure'))) {
        code = 'AUTH_CONTEXT_MISSING';
        status = 401;
    }

    // In production, return generic message but include error code for support
    if (isProd) {
        return {
            message: code === 'INTERNAL_ERROR'
                ? 'An error occurred processing your request'
                : `Resource unavailable: ${code.replace(/_/g, ' ')}`,
            status,
            code
        };
    }

    // In development, return actual message for debugging
    return {
        message: errorMsg,
        status,
        code
    };
}

/**
 * Creates a standardized error response
 */
export function errorResponse(error: unknown, context?: string) {
    const { message, status, code } = safeError(error, context);
    return { error: message, status, code };
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML/script tags
        .slice(0, 10000); // Limit length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || record.resetAt < now) {
        rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    return request.headers.get('x-real-ip')
        || 'unknown';
}
