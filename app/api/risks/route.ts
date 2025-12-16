
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const DEV_MODE = process.env.DEV_MODE === 'true';

// GET /api/risks - List all risks
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId, sessionClaims } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // DEV_MODE: Skip org check, or if user has no org, show their owned items
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        const userRole = (session.user as any).role || 'user';
        const isAdmin = ['admin', 'manager'].includes(userRole);

        // Build where clause with orgId fallback for dev/testing
        const whereClause: any = {};

        if (DEV_MODE) {
            // In dev mode, show all risks (no filtering)
        } else if (orgId) {
            whereClause.organizationId = orgId;
            if (!isAdmin) {
                whereClause.owner = session.user.email;
            }
        } else {
            // Fallback: show user's owned risks when no org
            whereClause.owner = session.user.email;
        }

        if (status) whereClause.status = status;
        if (category) whereClause.category = category;

        const risks = await prisma.risk.findMany({
            where: whereClause,
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

// POST /api/risks - Create new risk
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assetId, category, likelihood, impact, narrative, status: riskStatus } = body;

        const risk = await prisma.risk.create({
            data: {
                assetId: assetId || null,
                category: category || 'General',
                likelihood: likelihood || 3,
                impact: impact || 3,
                score: (likelihood || 3) * (impact || 3),
                narrative: narrative || 'New risk identified',
                status: riskStatus || 'open',
                owner: session.user.email,
                organizationId: session.user.orgId || null,
            }
        });

        return NextResponse.json({ risk }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating risk:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

