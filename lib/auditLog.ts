import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuditLogOptions {
    entity: string;
    entityId: string;
    action: 'created' | 'updated' | 'deleted';
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Log an audit trail entry for SOC 2 compliance
 */
export async function createAuditLog(options: AuditLogOptions) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.warn('Attempted to create audit log without authenticated user');
            return null;
        }

        const auditLog = await prisma.auditLog.create({
            data: {
                userId: session.user.id || session.user.email,
                userName: session.user.name || 'Unknown',
                userEmail: session.user.email,
                entity: options.entity,
                entityId: options.entityId,
                action: options.action,
                changes: JSON.stringify(options.changes || {}),
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
            },
        });

        return auditLog;
    } catch (error) {
        console.error('Error creating audit log:', error);
        return null;
    }
}

/**
 * Query audit logs with filtering
 */
export async function getAuditLogs(filters?: {
    entity?: string;
    entityId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}) {
    try {
        const where: any = {};

        if (filters?.entity) where.entity = filters.entity;
        if (filters?.entityId) where.entityId = filters.entityId;
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.startDate || filters?.endDate) {
            where.timestamp = {};
            if (filters.startDate) where.timestamp.gte = filters.startDate;
            if (filters.endDate) where.timestamp.lte = filters.endDate;
        }

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: filters?.limit || 100,
        });

        return logs.map(log => ({
            ...log,
            changes: JSON.parse(log.changes),
        }));
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityHistory(entity: string, entityId: string) {
    return getAuditLogs({ entity, entityId });
}
