```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        const risk = await prisma.risk.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
        }

        // Optional: strict check. 
        // If 'owner' is null (legacy data), maybe allow deletion or assign to current user? 
        // For now, if owner exists and mismatch, forbid.
        if (risk.owner && risk.owner !== session.user.email) {
            // Optional: allow admin override? Yes, if hasPermission
            const role = (session.user as any).role;
            const { canDeleteRecords } = await import('@/lib/permissions');
            if (!canDeleteRecords(role)) {
                return NextResponse.json({ error: 'Forbidden: Insufficient Privileges to Delete Risk' }, { status: 403 });
            }
        } else {
            // Even if owner matches, strict RBAC says only Admin can delete?
            // Or can Analysts delete their own?
            // "The Plan" says Managers/Analysts CANNOT delete records. Safety feature.
            // So we enforce canDeleteRecords strict.
            const role = (session.user as any).role;
            const { canDeleteRecords } = await import('@/lib/permissions');
            if (!canDeleteRecords(role)) {
                return NextResponse.json({ error: 'Forbidden: Only Admins can delete risks' }, { status: 403 });
            }
        }

        await prisma.risk.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
