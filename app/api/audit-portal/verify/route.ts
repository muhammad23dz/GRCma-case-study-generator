import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/audit-portal/verify - Verify access code and return audit data
// This is a PUBLIC endpoint for external auditors
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Access code required' }, { status: 400 });
        }

        // Find access by code
        const access = await prisma.auditorAccess.findUnique({
            where: { accessCode: code },
            include: {
                audit: {
                    include: {
                        findings: true,
                        tests: {
                            include: { control: true }
                        }
                    }
                },
                organization: {
                    select: { name: true }
                }
            }
        });

        if (!access) {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
        }

        // Check if active
        if (!access.isActive) {
            return NextResponse.json({ error: 'Access has been revoked' }, { status: 403 });
        }

        // Check expiration
        if (new Date() > access.expiresAt) {
            return NextResponse.json({ error: 'Access code has expired' }, { status: 403 });
        }

        // Update last accessed
        await prisma.auditorAccess.update({
            where: { id: access.id },
            data: {
                lastAccessedAt: new Date(),
                accessCount: { increment: 1 }
            }
        });

        // Get requests for this audit
        const requests = await prisma.auditRequest.findMany({
            where: { auditId: access.auditId },
            include: {
                attachments: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Return audit data (stripped of sensitive internal info)
        return NextResponse.json({
            auditor: {
                name: access.auditorName,
                email: access.auditorEmail,
                firm: access.firmName
            },
            organization: access.organization?.name,
            audit: {
                id: access.audit.id,
                title: access.audit.title,
                auditType: access.audit.auditType,
                framework: access.audit.framework,
                scope: access.audit.scope,
                status: access.audit.status,
                startDate: access.audit.startDate,
                endDate: access.audit.endDate,
                findingsCount: access.audit.findings.length,
                testsCount: access.audit.tests.length
            },
            requests,
            expiresAt: access.expiresAt
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditPortal Verify');
        return NextResponse.json({ error: message }, { status });
    }
}
