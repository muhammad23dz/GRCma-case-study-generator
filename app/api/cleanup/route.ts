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
        const userId = session.user.id; // needed for Report deletion if linked by ID

        // Execute deletions in a transaction to ensure atomicity
        await prisma.$transaction([
            // Delete Risks
            prisma.risk.deleteMany({
                where: { owner: userEmail }
            }),
            // Delete Controls
            prisma.control.deleteMany({
                where: { owner: userEmail }
            }),
            // Delete Vendors 
            prisma.vendor.deleteMany({
                where: { owner: userEmail }
            }),
            // Delete Policies
            prisma.policy.deleteMany({
                where: { owner: userEmail }
            }),
            // Delete Incidents
            prisma.incident.deleteMany({
                where: { reportedBy: userEmail }
            }),
            // Delete Actions
            prisma.action.deleteMany({
                where: { owner: userEmail }
            }),
            // Delete Evidence
            prisma.evidence.deleteMany({
                where: { uploadedBy: userEmail }
            }),
            // Delete Reports (linked by userId usually, let's check schema if email is used or relation)
            // Schema says: user User @relation(fields: [userId], references: [id])
            // So we need to use userId for reports.
            prisma.report.deleteMany({
                where: { userId: userId }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Dashboard cleaned successfully' });
    } catch (error: any) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
