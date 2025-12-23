import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/bcdr/plans - List BCDR Plans
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const plans = await prisma.bCDRPlan.findMany({
            where: { owner: userEmail },
            include: {
                tests: {
                    orderBy: { testDate: 'desc' },
                    take: 3
                },
                _count: {
                    select: { tests: true, processes: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ plans });
    } catch (error: any) {
        console.error('Error fetching BCDR plans:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/bcdr/plans - Create BCDR Plan
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { title, type, description, rto, rpo, mtpd, nextTestDate } = body;

        const plan = await prisma.bCDRPlan.create({
            data: {
                title,
                type: type || 'BCP',
                description,
                rto,
                rpo,
                mtpd,
                nextTestDate: nextTestDate ? new Date(nextTestDate) : null,
                owner: userEmail,
                status: 'draft'
            }
        });

        return NextResponse.json({ plan }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating BCDR plan:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
