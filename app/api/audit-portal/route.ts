import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';
import crypto from 'crypto';

// Input Validation
const createAccessSchema = z.object({
    auditId: z.string().cuid(),
    auditorEmail: z.string().email(),
    auditorName: z.string().min(2).max(100),
    firmName: z.string().max(200).optional(),
    expiresInDays: z.number().int().min(1).max(90).default(30)
});

// Generate secure random access code
function generateAccessCode(): string {
    return crypto.randomBytes(16).toString('base64url');
}

// GET /api/audit-portal - List auditor access for an audit
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const auditId = searchParams.get('auditId');

        if (!auditId) {
            return NextResponse.json({ error: 'auditId required' }, { status: 400 });
        }

        // Verify audit belongs to user's org
        const audit = await prisma.audit.findFirst({
            where: {
                id: auditId,
                organizationId: context.orgId
            }
        });

        if (!audit) {
            return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

        const accessList = await prisma.auditorAccess.findMany({
            where: { auditId },
            include: {
                _count: { select: { requests: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ accessList });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditPortal GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/audit-portal - Create new auditor access
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate input
        const parseResult = createAccessSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { auditId, auditorEmail, auditorName, firmName, expiresInDays } = parseResult.data;

        // Verify audit belongs to user's org
        const audit = await prisma.audit.findFirst({
            where: {
                id: auditId,
                organizationId: context.orgId
            }
        });

        if (!audit) {
            return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

        // Generate secure access code
        const accessCode = generateAccessCode();
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        const auditorAccess = await prisma.auditorAccess.create({
            data: {
                auditId,
                accessCode,
                auditorEmail,
                auditorName,
                firmName,
                expiresAt,
                organizationId: context.orgId
            }
        });

        await logAudit({
            entity: 'AuditorAccess',
            entityId: auditorAccess.id,
            action: 'CREATE',
            changes: { auditorEmail, firmName, expiresAt: expiresAt.toISOString() }
        });

        return NextResponse.json({
            auditorAccess,
            // Include access code only in creation response
            accessCode,
            portalUrl: `/auditor-portal?code=${accessCode}`
        }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditPortal POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/audit-portal?id=xxx - Revoke auditor access
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        // Verify access belongs to user's org
        const access = await prisma.auditorAccess.findFirst({
            where: {
                id,
                organizationId: context.orgId
            }
        });

        if (!access) {
            return NextResponse.json({ error: 'Access not found' }, { status: 404 });
        }

        await prisma.auditorAccess.update({
            where: { id },
            data: { isActive: false }
        });

        await logAudit({
            entity: 'AuditorAccess',
            entityId: id,
            action: 'DELETE',
            changes: { revoked: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditPortal DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}
