import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;
        console.log(`[CLEANUP] Starting cleanup for user: ${userEmail}`);

        // Execute deletions in a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Delete Evidence first (has foreign keys)
            const evidenceCount = await tx.evidence.deleteMany({
                where: { uploadedBy: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${evidenceCount.count} evidence records`);

            // Delete Actions
            const actionsCount = await tx.action.deleteMany({
                where: { owner: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${actionsCount.count} actions`);

            // Delete Incidents
            const incidentsCount = await tx.incident.deleteMany({
                where: { reportedBy: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${incidentsCount.count} incidents`);

            // Delete Risks
            const risksCount = await tx.risk.deleteMany({
                where: { owner: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${risksCount.count} risks`);

            // Delete Controls
            const controlsCount = await tx.control.deleteMany({
                where: { owner: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${controlsCount.count} controls`);

            // Delete Vendors
            const vendorsCount = await tx.vendor.deleteMany({
                where: { owner: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${vendorsCount.count} vendors`);

            // Delete Policies
            const policiesCount = await tx.policy.deleteMany({
                where: { owner: userEmail }
            });
            console.log(`[CLEANUP] Deleted ${policiesCount.count} policies`);

            return {
                evidence: evidenceCount.count,
                actions: actionsCount.count,
                incidents: incidentsCount.count,
                risks: risksCount.count,
                controls: controlsCount.count,
                vendors: vendorsCount.count,
                policies: policiesCount.count
            };
        });

        console.log(`[CLEANUP] Cleanup completed successfully for ${userEmail}`, result);
        return NextResponse.json({
            success: true,
            message: 'Dashboard cleaned successfully',
            deletedCounts: result
        });
    } catch (error: any) {
        console.error('[CLEANUP] Cleanup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
