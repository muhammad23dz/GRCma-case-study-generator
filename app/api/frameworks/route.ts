import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/frameworks - List all frameworks
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const frameworks = await prisma.framework.findMany({
            include: {
                _count: {
                    select: { mappings: true }
                }
            }
        });

        return NextResponse.json({ frameworks });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/frameworks - Create framework
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, version, jurisdiction, description } = body;

        const framework = await prisma.framework.create({
            data: { name, version, jurisdiction, description }
        });

        return NextResponse.json({ framework }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
