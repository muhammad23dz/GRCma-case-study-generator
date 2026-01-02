import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/assets/[id] - Get single Asset
export async function GET(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;

        const asset = await prisma.asset.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Asset')
            },
            include: {
                risks: { include: { risk: true } },
                controls: { include: { control: true } }
            }
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
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
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const isolationFilter = getIsolationFilter(context, 'Asset');

        // Verify existence before update
        const existing = await prisma.asset.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
        }

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
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Asset');

        // Verify existence before delete
        const existing = await prisma.asset.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
        }

        await prisma.asset.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting asset:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
