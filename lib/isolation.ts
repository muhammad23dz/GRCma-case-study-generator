import { auth, currentUser } from '@clerk/nextjs/server';

export interface IsolationContext {
    userId: string; // Prisma DB ID
    clerkId: string;
    email: string;
    orgId: string | null;
    role: string;
    securitySettings?: {
        sessionTtl?: number;
        mfaRequired?: boolean;
        passwordPolicy?: string;
    };
}

/**
 * Helper to check if MFA is required for the current context.
 */
export function isMfaRequired(context: IsolationContext): boolean {
    return context.securitySettings?.mfaRequired || false;
}

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<string, number> = {
    admin: 100,
    manager: 75,
    contributor: 60,
    analyst: 50,
    auditor: 40,
    user: 25,
    viewer: 10,
    disabled: 0
};

// Permission definitions by role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ['*'],
    manager: [
        'risks:read', 'risks:write', 'risks:delete',
        'controls:read', 'controls:write', 'controls:delete',
        'policies:read', 'policies:write', 'policies:delete',
        'vendors:read', 'vendors:write', 'vendors:delete',
        'audits:read', 'audits:write',
        'reports:read', 'reports:export',
        'users:read', 'users:invite'
    ],
    contributor: [
        'risks:read', 'risks:write',
        'controls:read', 'controls:write',
        'policies:read', 'policies:write',
        'vendors:read', 'vendors:write',
        'actions:read', 'actions:write',
        'evidence:read', 'evidence:write'
    ],
    analyst: [
        'risks:read', 'risks:write',
        'controls:read', 'controls:write',
        'policies:read',
        'vendors:read',
        'audits:read',
        'reports:read'
    ],
    auditor: [
        'risks:read',
        'controls:read',
        'policies:read',
        'vendors:read',
        'audits:read', 'audits:write',
        'evidence:read', 'evidence:write',
        'reports:read', 'reports:export'
    ],
    user: [
        'risks:read',
        'controls:read',
        'policies:read',
        'training:read', 'training:complete',
        'actions:read', 'actions:write'
    ],
    viewer: [
        'risks:read',
        'controls:read',
        'policies:read',
        'reports:read'
    ],
    disabled: []
};

/**
 * Resolves the current user's identity and provides a consistent context for data isolation.
 * Automatically handles the mapping between Clerk IDs and Prisma DB IDs.
 * RESILIENT: Falls back to Clerk-only context if database is unavailable.
 */
export async function getIsolationContext(): Promise<IsolationContext | null> {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            console.log('[Isolation] No Clerk userId found - user not authenticated');
            return null;
        }

        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
        const name = user?.fullName || user?.firstName || 'User';

        console.log('[Isolation] Auth check - clerkId:', clerkId, 'email:', email);

        // Check if we have a valid DATABASE_URL - support common schemes
        const dbUrl = process.env.DATABASE_URL || '';
        const hasValidDb = dbUrl.length > 0 && (
            dbUrl.startsWith('postgres://') ||
            dbUrl.startsWith('postgresql://') ||
            dbUrl.startsWith('prisma://') ||
            dbUrl.startsWith('mysql://') ||
            dbUrl.startsWith('file:') ||
            dbUrl.includes('@') // Connection strings typically have user@host
        );

        if (!hasValidDb) {
            console.warn('[Isolation] No valid DATABASE_URL - using Clerk-only context');
            return {
                userId: clerkId,
                clerkId,
                email,
                orgId: null,
                role: 'user'
            };
        }

        // Try to resolve from database, with fallback
        try {
            const { prisma } = await import('./prisma');

            // Robust DB User Resolution
            let dbUser = await prisma.user.findUnique({
                where: { id: clerkId },
                select: {
                    id: true,
                    email: true,
                    orgId: true,
                    role: true,
                    organization: {
                        select: {
                            securitySettings: true
                        }
                    }
                }
            });

            // Fallback search by email if ID doesn't match
            if (!dbUser && email) {
                dbUser = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        email: true,
                        orgId: true,
                        role: true,
                        organization: {
                            select: {
                                securitySettings: true
                            }
                        }
                    }
                });
            }

            if (!dbUser && email) {
                try {
                    // Auto-provision user record if authenticated via Clerk but missing in DB
                    dbUser = await prisma.user.create({
                        data: {
                            id: clerkId,
                            email,
                            name,
                            role: 'user'
                        },
                        select: {
                            id: true,
                            email: true,
                            orgId: true,
                            role: true,
                            organization: {
                                select: {
                                    securitySettings: true
                                }
                            }
                        }
                    });
                    console.log('[Isolation] Auto-provisioned user:', email);
                } catch (createErr: any) {
                    // If table doesn't exist or other DB error, fall back to Clerk-only context
                    if (createErr.code === 'P2021' || createErr.message?.includes('does not exist')) {
                        console.warn('[Isolation] User table not found - using Clerk-only context');
                        return {
                            userId: clerkId,
                            clerkId,
                            email,
                            orgId: null,
                            role: 'user'
                        };
                    }
                    console.error('[Isolation] Failed to auto-provision user:', createErr);
                    throw createErr;
                }
            }

            if (!dbUser) {
                // No DB user and couldn't create - use Clerk-only context
                console.warn('[Isolation] No DB user found - using Clerk-only context');
                return {
                    userId: clerkId,
                    clerkId,
                    email,
                    orgId: null,
                    role: 'user'
                };
            }

            return {
                userId: dbUser.id,
                clerkId,
                email: dbUser.email || email,
                orgId: dbUser.orgId,
                role: dbUser.role || 'user',
                securitySettings: dbUser.organization?.securitySettings as any
            };
        } catch (dbError: any) {
            // Database connection or table doesn't exist - fall back to Clerk-only
            if (dbError.code === 'P2021' || dbError.message?.includes('does not exist') || dbError.code === 'P1001') {
                console.warn('[Isolation] Database unavailable - using Clerk-only context');
                return {
                    userId: clerkId,
                    clerkId,
                    email,
                    orgId: null,
                    role: 'user'
                };
            }
            throw dbError;
        }
    } catch (error) {
        console.error('[Isolation] Critical error resolving context:', error);
        // If it's already one of our descriptive errors, rethrow it
        if (error instanceof Error && (error.message.includes('Infrastructure') || error.message.includes('Unauthorized'))) {
            throw error;
        }
        // Otherwise wrap it
        throw new Error('Infrastructure Error: Context resolution failed');
    }
}

/**
 * Checks if the current context has a specific permission.
 */
export function hasPermission(context: IsolationContext, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[context.role] || ROLE_PERMISSIONS.user;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
}

/**
 * Returns a Prisma 'where' clause fragment for model-level isolation.
 * Expert Tier: Handles different ownership keys (userId vs owner vs reportedBy)
 */
export function getIsolationFilter(context: IsolationContext, modelType: string): any {
    const { userId, email } = context;

    switch (modelType) {
        case 'Report':
        case 'AuditLog':
        case 'User':
        case 'LLMUsage':
        case 'Subscription':
            return { userId };
        case 'Incident':
            return { reportedBy: email };
        case 'Change':
            return { requestedBy: email };
        case 'Evidence':
        case 'EvidenceFile':
            return { uploadedBy: email };
        case 'Gap':
        case 'RemediationStep':
        case 'AuditFinding':
        case 'Control':
        case 'Risk':
        case 'Policy':
        case 'Vendor':
        case 'Action':
        case 'Asset':
        case 'BCDRPlan':
        case 'BusinessProcess':
        case 'Questionnaire':
        case 'Runbook':
            return { owner: email };
        case 'Employee':
        case 'TrainingCourse':
        case 'SaaSApp':
            return { organizationId: context.orgId };
        default:
            // Standard GRC modules use 'owner' email
            return { owner: email };
    }
}
