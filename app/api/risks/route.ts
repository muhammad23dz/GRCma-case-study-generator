import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/risks - List all risks
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        const risks = await prisma.risk.findMany({
            where: {
                owner: session.user.email,
                ...(status && { status }),
                ...(category && { category }),
            },
            include: {
                control: true,
                _count: {
                    select: { evidences: true }
                }
            },
            orderBy: { score: 'desc' }
        });

        return NextResponse.json({ risks });
    } catch (error: any) {
        console.error('Error fetching risks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
