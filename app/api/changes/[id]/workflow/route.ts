import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST /api/changes/[id]/workflow
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const userEmail = user.emailAddresses[0]?.emailAddress || 'unknown';
        const userName = user.fullName || user.firstName || 'User';

        const { id } = params;

        const body = await request.json();
        const { action, comments } = body; // action: 'submit', 'approve', 'reject', 'implement'

        const change = await prisma.change.findUnique({
            where: { id }
        });

        if (!change) {
            return NextResponse.json({ error: 'Change not found' }, { status: 404 });
        }

        let updateData: any = {};
        let newStatus = change.status;

        // Workflow Transitions - get user role from DB
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        const userRole = dbUser?.role || 'user';

        const { canApprove } = await import('@/lib/permissions');
        const isApprover = canApprove(userRole);
        const isOwner = change.requestedBy === userEmail;

        if (action === 'submit') {
            // Only Owner or Admin can submit
            if (!isOwner && !isApprover) {
                return NextResponse.json({ error: 'Forbidden: Only the requester can submit this change' }, { status: 403 });
            }

            if (change.status !== 'draft') {
                return NextResponse.json({ error: 'Invalid transition' }, { status: 400 });
            }
            if (change.changeType === 'standard') {
                newStatus = 'scheduled';
                updateData.approvalStatus = 'approved';
            } else {
                newStatus = 'reviewing';
                // Simulate creating approval request
                await prisma.changeApproval.create({
                    data: {
                        changeId: change.id,
                        approverRole: 'cab_member',
                        approverEmail: 'manager@example.com',
                        approverName: 'Change Manager',
                        decision: 'pending'
                    }
                });
            }
        }
        else if (action === 'approve') {
            if (!isApprover) return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });

            newStatus = 'scheduled';
            updateData.approvalStatus = 'approved';
            updateData.approvedBy = userEmail;
            updateData.approvedAt = new Date();
        }
        else if (action === 'reject') {
            if (!isApprover) return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });

            newStatus = 'rejected';
            updateData.approvalStatus = 'rejected';
        }
        else if (action === 'implement') {
            if (!isApprover) return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });

            newStatus = 'completed';
            updateData.implementedAt = new Date();
            updateData.currentStage = 'closure';
        }

        // Update Change
        const updatedChange = await prisma.change.update({
            where: { id },
            data: {
                status: newStatus,
                ...updateData
            }
        });

        // Log Comment/Audit
        await prisma.changeComment.create({
            data: {
                changeId: change.id,
                authorEmail: userEmail,
                authorName: userName,
                comment: `Changed status to ${newStatus}. ${comments || ''}`,
                commentType: 'workflow'
            }
        });

        return NextResponse.json({ change: updatedChange });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
