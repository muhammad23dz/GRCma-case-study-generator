import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/bcdr/tests - List DR Tests
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('planId');

        const tests = await prisma.dRTest.findMany({
            where: planId ? { planId } : {},
            include: {
                plan: {
                    select: { id: true, title: true, type: true }
                }
            },
            orderBy: { testDate: 'desc' }
        });

        return NextResponse.json({ tests });
    } catch (error: any) {
        console.error('Error fetching DR tests:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/bcdr/tests - Schedule DR Test
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { planId, title, testDate, type, attendees } = body;

        if (!planId || !title || !testDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const test = await prisma.dRTest.create({
            data: {
                planId,
                title,
                testDate: new Date(testDate),
                type: type || 'tabletop',
                attendees: attendees ? JSON.stringify(attendees) : null,
                status: 'scheduled'
            },
            include: {
                plan: { select: { title: true } }
            }
        });

        return NextResponse.json({ test }, { status: 201 });
    } catch (error: any) {
        console.error('Error scheduling DR test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
