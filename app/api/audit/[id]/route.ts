import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/audit/[id] - Get specific audit with all details
export async function GET(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;

        const audit = await prisma.audit.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Audit')
            },
            include: {
                findings: {
                    include: {
                        control: {
                            select: {
                                id: true,
                                title: true,
                                controlType: true,
                                controlRisk: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                tests: {
                    include: {
                        control: {
                            select: {
                                id: true,
                                title: true
                            }
                        },
                        evidence: {
                            select: {
                                id: true,
                                fileName: true,
                                evidenceType: true
                            }
                        }
                    },
                    orderBy: { testDate: 'desc' }
                }
            }
        });

        if (!audit) {
            return NextResponse.json({ error: 'Audit not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ audit });
    } catch (error: any) {
        console.error('Error fetching audit:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// PATCH /api/audit/[id] - Update audit status
export async function PATCH(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const { status, endDate } = body;
        const isolationFilter = getIsolationFilter(context, 'Audit');

        // Verify existence before update
        const existing = await prisma.audit.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Audit not found or access denied' }, { status: 404 });
        }

        const audit = await prisma.audit.update({
            where: { id },
            data: {
                status,
                endDate: endDate ? new Date(endDate) : undefined,
                updatedAt: new Date()
            },
            include: {
                findings: true,
                tests: true
            }
        });

        return NextResponse.json({ audit });
    } catch (error: any) {
        console.error('Error updating audit:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/audit/[id] - Delete audit
export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Audit');

        // Verify existence before delete
        const existing = await prisma.audit.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Audit not found or access denied' }, { status: 404 });
        }

        await prisma.audit.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Audit deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting audit:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
