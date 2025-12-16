
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const DEV_MODE = process.env.DEV_MODE === 'true';

// GET /api/vendors - List all vendors
export async function GET() {
    try {
        const { userId, orgId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const whereClause: any = {};

        if (!DEV_MODE && orgId) {
            whereClause.organizationId = orgId;
        }

        const vendors = await prisma.vendor.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { assessments: true, evidences: true }
                },
                vendorRisks: {
                    include: {
                        risk: true
                    }
                }
            },
            orderBy: { riskScore: 'desc' }
        });

        return NextResponse.json({ vendors });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, criticality, services, contactEmail, category } = body;

        const vendor = await prisma.vendor.create({
            data: {
                name,
                category: category || 'Service',
                criticality: criticality || 'medium',
                services,
                contactEmail,
                owner: session.user.email,
                status: 'active',
                organizationId: session.user.orgId || null,
            }
        });

        // GRC Automation: TPRM Hook
        try {
            const { assessVendorRisk } = await import('@/lib/grc-automation');
            await assessVendorRisk(vendor.id, vendor.name, criticality, session.user.email);
        } catch (error) {
            console.error('Failed to run TPRM automation:', error);
        }

        return NextResponse.json({ vendor }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

