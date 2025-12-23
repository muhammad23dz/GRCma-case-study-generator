import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/controls/tests - List Control Tests
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlId = searchParams.get('controlId');

        const tests = await prisma.controlTest.findMany({
            where: controlId ? { controlId } : {},
            include: {
                control: {
                    select: { id: true, title: true, controlType: true }
                }
            },
            orderBy: { testDate: 'desc' }
        });

        // Aggregate stats
        const stats = {
            total: tests.length,
            passed: tests.filter(t => t.result === 'pass').length,
            failed: tests.filter(t => t.result === 'fail').length,
            pending: tests.filter(t => t.result === 'pending').length,
            passRate: tests.length > 0
                ? Math.round(tests.filter(t => t.result === 'pass').length / tests.length * 100)
                : 0
        };

        return NextResponse.json({ tests, stats });
    } catch (error: any) {
        console.error('Error fetching control tests:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/controls/tests - Create Control Test
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { controlId, testDate, testType, testProcedure, results, findings, evidenceLinks } = body;

        if (!controlId) {
            return NextResponse.json({ error: 'Control ID is required' }, { status: 400 });
        }

        const test = await prisma.controlTest.create({
            data: {
                controlId,
                testDate: testDate ? new Date(testDate) : new Date(),
                tester: userEmail,
                testType: testType || 'design',
                testProcedure,
                result: 'pending',
                findings,
                evidenceLinks: evidenceLinks ? JSON.stringify(evidenceLinks) : null
            },
            include: {
                control: { select: { title: true } }
            }
        });

        return NextResponse.json({ test }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating control test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/controls/tests - Update Test Result
export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { testId, result, findings, recommendations } = body;

        if (!testId) {
            return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
        }

        const test = await prisma.controlTest.update({
            where: { id: testId },
            data: {
                result,
                findings,
                recommendations
            }
        });

        return NextResponse.json({ test });
    } catch (error: any) {
        console.error('Error updating control test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
