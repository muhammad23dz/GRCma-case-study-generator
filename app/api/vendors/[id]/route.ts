import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

// GET /api/vendors/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const vendor = await prisma.vendor.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Vendor')
            },
            include: {
                assessments: { orderBy: { assessmentDate: 'desc' } },
                vendorRisks: { include: { risk: true } },
                evidences: true,
                _count: { select: { assessments: true, evidences: true, vendorRisks: true } }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found or access denied' }, { status: 404 });
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
    } catch (error: unknown) {
        console.error('Error fetching vendor:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/vendors/[id]
export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const role = user?.publicMetadata?.role as string || 'user';

        const { canDeleteRecords } = await import('@/lib/permissions');
        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete vendors' }, { status: 403 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Vendor');

        // Transaction to clean up orphans (Evidence has no Cascade in Schema)
        await prisma.$transaction(async (tx) => {
            // First verify the vendor exists and belongs to the user/org
            const vendor = await tx.vendor.findFirst({
                where: { id, ...isolationFilter }
            });

            if (!vendor) {
                throw new Error('Vendor not found or access denied');
            }

            // 1. Delete linked Evidence
            await tx.evidence.deleteMany({
                where: { vendorId: id }
            });

            // 2. Delete Vendor
            await tx.vendor.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting vendor:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
