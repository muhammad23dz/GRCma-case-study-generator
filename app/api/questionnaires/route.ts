import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/questionnaires - List Questionnaires
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const questionnaires = await prisma.questionnaire.findMany({
            where: { owner: userEmail },
            include: {
                _count: {
                    select: { questions: true, responses: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ questionnaires });
    } catch (error: any) {
        console.error('Error fetching questionnaires:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/questionnaires - Create Questionnaire
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { title, description, type } = body;

        const questionnaire = await prisma.questionnaire.create({
            data: {
                title,
                description,
                type: type || 'internal',
                owner: userEmail,
                status: 'draft'
            }
        });

        return NextResponse.json({ questionnaire }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating questionnaire:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
