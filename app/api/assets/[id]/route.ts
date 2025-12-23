import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/assets/[id] - Get single Asset
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                risks: { include: { risk: true } },
                controls: { include: { control: true } }
            }
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json({ asset });
    } catch (error: any) {
        console.error('Error fetching asset:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/assets/[id] - Update Asset
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const asset = await prisma.asset.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                category: body.category,
                status: body.status,
                criticality: body.criticality,
                location: body.location,
                description: body.description,
                value: body.value,
                confidentiality: body.confidentiality,
                integrity: body.integrity,
                availability: body.availability,
                endOfLife: body.endOfLife ? new Date(body.endOfLife) : null
            }
        });

        return NextResponse.json({ asset });
    } catch (error: any) {
        console.error('Error updating asset:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/assets/[id] - Delete Asset
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.asset.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting asset:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
