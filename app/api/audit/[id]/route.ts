import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit/[id] - Get specific audit with all details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const audit = await prisma.audit.findUnique({
            where: { id },
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
            return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

        return NextResponse.json({ audit });
    } catch (error: any) {
        console.error('Error fetching audit:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/audit/[id] - Update audit status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, endDate } = body;

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/audit/[id] - Delete audit
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.audit.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Audit deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting audit:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
