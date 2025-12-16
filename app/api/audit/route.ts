import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit - List all audits
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // DEV_MODE bypass
        if (process.env.DEV_MODE === 'true') {
            const audits = await prisma.audit.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    findings: true,
                    tests: true,
                    _count: {
                        select: {
                            findings: true,
                            tests: true
                        }
                    }
                }
            });
            return NextResponse.json({ audits });
        }

        if (!orgId) {
            return NextResponse.json({ error: 'No organization found' }, { status: 400 });
        }

        const audits = await prisma.audit.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
            include: {
                findings: true,
                tests: true,
                _count: {
                    select: {
                        findings: true,
                        tests: true
                    }
                }
            }
        });

        return NextResponse.json({ audits });
    } catch (error: any) {
        console.error('Error fetching audits:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/audit - Create new audit
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, auditType, framework, scope, startDate, auditorName, auditorOrg } = body;

        if (!title || !auditType || !startDate || !auditorName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const audit = await prisma.audit.create({
            data: {
                title,
                auditType,
                framework,
                scope,
                startDate: new Date(startDate),
                auditorName,
                auditorOrg,
                status: 'planning',
                organizationId: orgId || undefined
            },
            include: {
                findings: true,
                tests: true
            }
        });

        return NextResponse.json({ audit }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating audit:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
