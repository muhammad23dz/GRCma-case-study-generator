import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/assets - List Assets
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const assets = await prisma.asset.findMany({
            where: { owner: userEmail },
            include: {
                _count: {
                    select: { risks: true, controls: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ assets });
    } catch (error: any) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/assets - Create Asset
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { name, type, category, criticality, location, description, value, confidentiality, integrity, availability } = body;

        const asset = await prisma.asset.create({
            data: {
                name,
                type: type || 'hardware',
                category,
                criticality: criticality || 'medium',
                location,
                description,
                value,
                confidentiality,
                integrity,
                availability,
                owner: userEmail,
                status: 'active'
            }
        });

        return NextResponse.json({ asset }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating asset:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
