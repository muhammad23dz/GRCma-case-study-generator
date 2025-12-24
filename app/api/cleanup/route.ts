import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/cleanup - Delete all user's GRC data
export async function DELETE() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }

        console.log(`[CLEANUP] Starting cleanup for user: ${userId} (${userEmail})`);

        // Use a transaction to ensure all-or-nothing cleanup and handle constraints
        const result = await prisma.$transaction(async (tx) => {
            // 1. Join/Relation Tables (Many-to-Many) - Delete these first
            const rc = await tx.riskControl.deleteMany({
                where: { OR: [{ risk: { owner: userEmail } }, { control: { owner: userEmail } }] }
            });
            const ir = await tx.incidentRisk.deleteMany({
                where: { OR: [{ incident: { reportedBy: userEmail } }, { risk: { owner: userEmail } }] }
            });
            const vr = await tx.vendorRisk.deleteMany({
                where: { OR: [{ vendor: { owner: userEmail } }, { risk: { owner: userEmail } }] }
            });
            const cr = await tx.changeRisk.deleteMany({
                where: { OR: [{ change: { requestedBy: userEmail } }, { risk: { owner: userEmail } }] }
            });
            const pc = await tx.policyControl.deleteMany({
                where: { OR: [{ policy: { owner: userEmail } }, { control: { owner: userEmail } }] }
            });
            const ic = await tx.incidentControl.deleteMany({
                where: { OR: [{ incident: { reportedBy: userEmail } }, { control: { owner: userEmail } }] }
            });

            // 2. Child Entities / Task Tables
            const rem = await tx.remediationStep.deleteMany({
                where: { gap: { owner: userEmail } }
            });
            const ct = await tx.controlTest.deleteMany({
                where: { control: { owner: userEmail } }
            });
            const fnd = await tx.auditFinding.deleteMany({
                where: { control: { owner: userEmail } }
            });
            const evf = await tx.evidenceFile.deleteMany({
                where: { uploadedBy: userEmail }
            });
            const pv = await tx.policyVersion.deleteMany({
                where: { policy: { owner: userEmail } }
            });
            const pa = await tx.policyAttestation.deleteMany({
                where: { policy: { owner: userEmail } }
            });
            const rh = await tx.riskHistory.deleteMany({
                where: { risk: { owner: userEmail } }
            });

            // 3. Primary Feature Entities
            const act = await tx.action.deleteMany({
                where: { owner: userEmail }
            });
            const inc = await tx.incident.deleteMany({
                where: { reportedBy: userEmail }
            });
            const gap = await tx.gap.deleteMany({
                where: { owner: userEmail }
            });
            const aud = await tx.audit.deleteMany({
                where: { findings: { some: { control: { owner: userEmail } } } }
            });
            const ev = await tx.evidence.deleteMany({
                where: { uploadedBy: userEmail }
            });
            const att = await tx.attestation.deleteMany({
                where: { attestedBy: userEmail }
            });
            const vas = await tx.vendorAssessment.deleteMany({
                where: { vendor: { owner: userEmail } }
            });

            // 4. Core GRC Objects
            const rsk = await tx.risk.deleteMany({
                where: { owner: userEmail }
            });
            const ctrl = await tx.control.deleteMany({
                where: { owner: userEmail }
            });
            const vnd = await tx.vendor.deleteMany({
                where: { owner: userEmail }
            });
            const pol = await tx.policy.deleteMany({
                where: { owner: userEmail }
            });
            const chg = await tx.change.deleteMany({
                where: { requestedBy: userEmail }
            });

            // 5. Reports and System Data
            const rpt = await tx.report.deleteMany({
                where: { userId: userId }
            });
            const log = await tx.auditLog.deleteMany({
                where: { userEmail: userEmail }
            });
            const usage = await tx.lLMUsage.deleteMany({
                where: { userId: userId }
            }).catch(() => ({ count: 0 })); // Optional table

            return {
                relations: rc.count + ir.count + vr.count + cr.count + pc.count + ic.count,
                children: rem.count + ct.count + fnd.count + evf.count + pv.count + pa.count + rh.count,
                features: act.count + inc.count + gap.count + aud.count + ev.count + att.count + vas.count,
                core: rsk.count + ctrl.count + vnd.count + pol.count + chg.count,
                system: rpt.count + log.count + (usage as any).count
            };
        });

        console.log(`[CLEANUP] Cleanup completed successfully for ${userEmail}:`, result);
        return NextResponse.json({
            success: true,
            message: 'Dashboard wiped successfully',
            deletedCounts: result
        });
    } catch (error: any) {
        console.error('[CLEANUP] Critical cleanup failure:', error);
        return NextResponse.json({
            error: 'Failed to reset dashboard',
            details: error.message
        }, { status: 500 });
    }
}

// Keep POST for backwards compatibility
export async function POST() {
    return DELETE();
}
