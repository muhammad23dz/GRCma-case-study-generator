import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';

export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const org = await prisma.organization.findUnique({
            where: { id: context.orgId },
            select: { id: true, name: true, securitySettings: true }
        });

        return NextResponse.json(org);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Admin/Manager can update org settings
        if (!['admin', 'manager'].includes(context.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { securitySettings } = body;

        const updatedOrg = await prisma.organization.update({
            where: { id: context.orgId },
            data: { securitySettings }
        });

        return NextResponse.json(updatedOrg);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
