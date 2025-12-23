import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/frameworks - List all frameworks
export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const frameworks = await prisma.framework.findMany({
            include: {
                _count: {
                    select: { mappings: true }
                }
            }
        });

        // Custom sorting: Moroccan Law first, then others alphabetically
        const sortedFrameworks = frameworks.sort((a, b) => {
            if (a.name.includes('Moroccan') || a.name.includes('09-08')) return -1;
            if (b.name.includes('Moroccan') || b.name.includes('09-08')) return 1;
            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ frameworks: sortedFrameworks });
    } catch (error: unknown) {
        console.error('Error fetching frameworks:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/frameworks - Create framework
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, version, jurisdiction, description } = body;

        const framework = await prisma.framework.create({
            data: { name, version, jurisdiction, description }
        });

        return NextResponse.json({ framework }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating framework:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
