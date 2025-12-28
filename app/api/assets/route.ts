import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/assets - List Assets for current organization
export async function GET() {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const assets = await prisma.asset.findMany({
            where: getIsolationFilter(context, 'Asset'),
            include: {
                _count: {
                    select: { risks: true, controls: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ assets });
    } catch (error: any) {
        return NextResponse.json({ error: safeError(error, 'Assets GET').message }, { status: 500 });
    }
}

// POST /api/assets - Create Asset
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, category, criticality, location, description, value, confidentiality, integrity, availability } = body;

        if (!name) {
            return NextResponse.json({ error: 'Asset name is required.' }, { status: 400 });
        }

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
                owner: context.email,
                organizationId: context.orgId,
                status: 'active'
            }
        });

        return NextResponse.json({ asset }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: safeError(error, 'Assets POST').message }, { status: 500 });
    }
}
