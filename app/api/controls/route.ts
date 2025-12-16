import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const DEV_MODE = process.env.DEV_MODE === 'true';

// GET /api/controls - List all controls
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true } });
        const userEmail = dbUser?.email || '';
        const userRole = dbUser?.role || 'user';

        const { searchParams } = new URL(request.url);
        const controlType = searchParams.get('type');
        const isAdmin = ['admin', 'manager'].includes(userRole);

        // Build where clause
        const whereClause: any = {};

        if (DEV_MODE) {
            // In dev mode, show all controls
        } else if (orgId) {
            whereClause.organizationId = orgId;
            if (!isAdmin) {
                whereClause.owner = userEmail;
            }
        } else {
            whereClause.owner = userEmail;
        }

        if (controlType) whereClause.controlType = controlType;

        const controls = await prisma.control.findMany({
            where: whereClause,
            include: {
                mappings: {
                    include: {
                        framework: true
                    }
                },
                _count: {
                    select: {
                        evidences: true,
                        risks: true,
                        actions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ controls });
    } catch (error: any) {
        console.error('Error fetching controls:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/controls - Create new control
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        const body = await request.json();
        const { title, description, controlType, owner, controlRisk, evidenceRequirements } = body;

        const control = await prisma.control.create({
            data: {
                title,
                description,
                controlType: controlType || 'preventive',
                owner: owner || userEmail,
                controlRisk: controlRisk || 'medium',
                evidenceRequirements,
                organizationId: orgId || null,
            }
        });

        return NextResponse.json({ control }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating control:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
