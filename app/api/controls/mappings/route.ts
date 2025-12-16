import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/controls/mappings - List all framework mappings
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const mappings = await prisma.frameworkMapping.findMany({
            include: {
                control: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        controlType: true,
                    },
                },
                framework: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transform to legacy format for compatibility
        const transformedMappings = mappings.map(m => ({
            id: m.id,
            framework: m.framework.name,
            requirement: m.frameworkControlId,
            description: '',
            confidence: m.confidence,
            control: m.control,
        }));

        return NextResponse.json({ mappings: transformedMappings });
    } catch (error) {
        console.error('Error fetching mappings:', error);
        return NextResponse.json({ error: 'Failed to fetch mappings' }, { status: 500 });
    }
}

// POST /api/controls/mappings - Create new mapping
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { controlId, framework, requirement, description } = body;

        if (!controlId || !framework || !requirement) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the framework by name
        const frameworkRecord = await prisma.framework.findFirst({
            where: { name: framework },
        });

        if (!frameworkRecord) {
            return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
        }

        const mapping = await prisma.frameworkMapping.create({
            data: {
                controlId,
                frameworkId: frameworkRecord.id,
                frameworkControlId: requirement,
                confidence: 1.0,
                mappingSource: 'manual',
            },
            include: {
                control: true,
                framework: true,
            },
        });

        return NextResponse.json({ mapping }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating mapping:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create mapping' },
            { status: 500 }
        );
    }
}
