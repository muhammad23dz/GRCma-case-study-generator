import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/vendors/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;

        const vendor = await prisma.vendor.findUnique({
            where: { id },
            include: {
                assessments: { orderBy: { assessmentDate: 'desc' } },
                vendorRisks: { include: { risk: true } },
                evidences: true,
                _count: { select: { assessments: true, evidences: true, vendorRisks: true } }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Generate Radar Metrics (Simulated based on criticality/risk)
        const baseScore = vendor.riskScore || 50;
        const volatility = vendor.criticality === 'critical' ? 20 : 10;

        const radarMetrics = {
            security: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
            privacy: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
            legal: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
            availability: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
            financial: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
            reputation: Math.min(100, Math.max(0, baseScore + (Math.random() * volatility - volatility / 2))),
        };

        return NextResponse.json({ vendor, radarMetrics });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/vendors/[id]
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const role = (session.user as any).role;
        const { canDeleteRecords } = await import('@/lib/permissions');
        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete vendors' }, { status: 403 });
        }

        const { id } = await context.params;

        // Transaction to clean up orphans (Evidence has no Cascade in Schema)
        await prisma.$transaction(async (tx) => {
            // 1. Delete linked Evidence (or set vendorId null, but usually delete is preferred for cleanup)
            await tx.evidence.deleteMany({
                where: { vendorId: id }
            });

            // 2. Delete Vendor (Cascades to Assessments/VendorRisks per schema)
            await tx.vendor.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
