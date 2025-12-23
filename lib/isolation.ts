import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

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
 */
export async function getIsolationContext(): Promise<IsolationContext | null> {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            console.log('[Isolation] No Clerk userId found - user not authenticated');
            return null;
        }

        const user = await currentUser();
        const email = user?.primaryEmailAddress?.emailAddress || '';

        console.log('[Isolation] Auth check - clerkId:', clerkId, 'email:', email);

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

        // Fallback search by email if ID doesn't match (e.g. migration sync)
        if (!dbUser && email) {
            console.log('[Isolation] User not found by ID, trying email...');
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

        // Auto-provision if missing (Expert Level: Ensures consistency on every request)
        if (!dbUser && email) {
            console.log('[Isolation] Auto-provisioning new user:', email);
            dbUser = await prisma.user.create({
                data: {
                    id: clerkId,
                    email,
                    name: user?.fullName || user?.firstName || 'User',
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
        }

        if (!dbUser) {
            console.log('[Isolation] Could not resolve or create DB user');
            return null;
        }

        console.log('[Isolation] Context resolved for:', dbUser.email, 'role:', dbUser.role);

        return {
            userId: dbUser.id,
            clerkId,
            email: dbUser.email || email,
            orgId: dbUser.orgId,
            role: dbUser.role || 'user',
            securitySettings: dbUser.organization?.securitySettings as any
        };
    } catch (error) {
        console.error('[Isolation] Error resolving context:', error);
        return null;
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
            return { userId };
        case 'Incident':
            return { reportedBy: email };
        case 'Change':
            return { requestedBy: email };
        case 'Evidence':
            return { uploadedBy: email };
        default:
            // Standard GRC modules use 'owner' email
            return { owner: email };
    }
}
