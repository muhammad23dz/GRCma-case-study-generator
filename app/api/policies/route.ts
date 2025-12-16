import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/policies
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const policies = await prisma.policy.findMany({
            where: {
                owner: userId
            },
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Enforce RBAC for Creation
        const role = (session.user as any).role;
        const { canEditContent } = await import('@/lib/permissions');

        if (!canEditContent(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Analysts/Managers/Admins can create policies' }, { status: 403 });
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
