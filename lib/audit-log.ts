import { prisma } from './prisma';
import { getIsolationContext } from './isolation';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'GENERATE' | 'PUSH';

export async function logAudit(params: {
    entity: string;
    entityId?: string; // Optional for some actions
    action: string;
    changes: any;
    ipAddress?: string;
    userAgent?: string;
}) {
    try {
        const context = await getIsolationContext();
        if (!context) return;

        await prisma.auditLog.create({
            data: {
                userId: context.userId,
                userEmail: context.email,
                userName: context.email, // Use email as name fallback
                organizationId: context.orgId,
                resource: params.entity,
                resourceId: params.entityId || 'system',
                action: params.action,
                changes: typeof params.changes === 'string' ? params.changes : JSON.stringify(params.changes),
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            }
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
    }
}
