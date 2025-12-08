import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/controls - List all controls
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlType = searchParams.get('type');
        const owner = searchParams.get('owner');

        const controls = await prisma.control.findMany({
            where: {
                owner: session.user.email,
                ...(controlType && { controlType }),
                // ...(owner && { owner }), // Ignore query param, enforce session owner
            },
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
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, controlType, owner, controlRisk, evidenceRequirements } = body;

        const control = await prisma.control.create({
            data: {
                title,
                description,
                controlType,
                owner: owner || session.user.email,
                controlRisk,
                evidenceRequirements
            }
        });

        return NextResponse.json({ control }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating control:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
