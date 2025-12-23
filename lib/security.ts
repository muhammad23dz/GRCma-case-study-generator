/**
 * Security utilities for API error handling
 * Prevents information leakage in production while maintaining full logging
 */

const isProd = process.env.NODE_ENV === 'production';

/**
 * Safe error response - returns generic message in production
 * Always logs full error server-side for debugging
 */
export function safeError(error: unknown, context?: string): { message: string; status: number } {
    // Always log full error server-side
    if (context) {
        console.error(`[${context}] Error:`, error);
    } else {
        console.error('[API Error]', error);
    }

    // In production, return generic message
    if (isProd) {
        return {
            message: 'An error occurred processing your request',
            status: 500
        };
    }

    // In development, return actual message for debugging
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { message, status: 500 };
}

/**
 * Creates a standardized error response
 */
export function errorResponse(error: unknown, context?: string) {
    const { message, status } = safeError(error, context);
    return { error: message, status };
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
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}
