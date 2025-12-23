import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/control-tests
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlId = searchParams.get('controlId');
        const auditId = searchParams.get('auditId');

        const tests = await prisma.controlTest.findMany({
            where: {
                ...(controlId && { controlId }),
                ...(auditId && { auditId }),
            },
            include: {
                control: { select: { title: true, id: true } },
                audit: { select: { title: true, id: true } },
                evidence: true
            },
            orderBy: { testDate: 'desc' }
        });

        return NextResponse.json({ tests });
    } catch (error: unknown) {
        console.error('Error fetching control tests:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/control-tests
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { controlId, auditId, testProcedure, result, sampleSize, notes, evidenceId } = body;

        const test = await prisma.controlTest.create({
            data: {
                controlId,
                auditId,
                testProcedure: testProcedure || 'Manual test procedure',
                result: result || 'pending',
                sampleSize,
                notes,
                evidenceId,
                testDate: new Date()
            }
        });

        return NextResponse.json({ test });
    } catch (error: unknown) {
        console.error('Error creating control test:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
