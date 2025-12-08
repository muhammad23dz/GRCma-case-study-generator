import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/policies
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const policies = await prisma.policy.findMany({
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ policies });
    } catch (error: any) {
        console.error('Error fetching policies:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/policies
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, version, content, reviewDate } = body;

        const policy = await prisma.policy.create({
            data: {
                title,
                version,
                content,
                reviewDate: new Date(reviewDate),
                owner: session.user.email
            }
        });

        return NextResponse.json({ policy });
    } catch (error: any) {
        console.error('Error creating policy:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
