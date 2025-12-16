import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createHmac } from 'crypto';

export interface AuditLogOptions {
    entity: string;
    entityId: string;
    action: 'created' | 'updated' | 'deleted';
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

// Secret key for HMAC signing (should be rotated and stored securely)
const AUDIT_SECRET = process.env.AUDIT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-audit-secret-do-not-use-in-prod';

function generateHash(data: string, timestamp: string): string {
    return createHmac('sha256', AUDIT_SECRET)
        .update(`${data}:${timestamp}`)
        .digest('hex');
}

/**
 * Log an audit trail entry for SOC 2 compliance with Tamper-Evident Hashing
 */
export async function createAuditLog(options: AuditLogOptions) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.warn('Attempted to create audit log without authenticated user');
            return null;
        }

        const changesStr = JSON.stringify(options.changes || {});
        // Construct canonical string for hashing
        // userId:entity:entityId:action:changes
        const userId = session.user.id || session.user.email;
        const timestamp = new Date();

        const canonicalData = `${userId}:${options.entity}:${options.entityId}:${options.action}:${changesStr}`;
        const hash = generateHash(canonicalData, timestamp.toISOString());

        const auditLog = await prisma.auditLog.create({
            data: {
                userId: userId,
                userName: session.user.name || 'Unknown',
                userEmail: session.user.email,
                entity: options.entity,
                entityId: options.entityId,
                action: options.action,
                changes: changesStr,
                ipAddress: options.ipAddress,
                userAgent: options.userAgent,
                hash: hash,
                timestamp: timestamp
            },
        });

        return auditLog;
    } catch (error) {
        console.error('Error creating audit log:', error);
        return null;
    }
}

/**
 * Very integrity of an audit log entry
 */
export async function verifyAuditLogIntegrity(logId: string): Promise<boolean> {
    const log = await prisma.auditLog.findUnique({ where: { id: logId } });
    if (!log || !log.hash) return false;

    const changesStr = log.changes;
    const userId = log.userId;
    const canonicalData = `${userId}:${log.entity}:${log.entityId}:${log.action}:${changesStr}`;
    const expectedHash = generateHash(canonicalData, log.timestamp.toISOString());

    return log.hash === expectedHash;
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

