import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { safeError } from '@/lib/security';

// Helper to get correct DB user ID
async function getDbUserId(userId: string): Promise<string> {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (userEmail) {
        const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
        if (dbUser) return dbUser.id;
    }
    return userId;
}

// DELETE /api/reports/[id] - Delete a specific report
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Step 1: Try cookie-based auth first
        let userId: string | null = null;

        const authResult = await auth();
        userId = authResult.userId;

        // Step 2: If cookie auth fails, try Bearer token from Authorization header
        if (!userId) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                try {
                    const { verifyToken } = await import('@clerk/backend');
                    const verified = await verifyToken(token, {
                        secretKey: process.env.CLERK_SECRET_KEY!
                    });
                    if (verified?.sub) {
                        userId = verified.sub;
                    }
                } catch (tokenError: any) {
                    console.error('[Reports DELETE] Token verification error:', tokenError.message);
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUserId = await getDbUserId(userId);
        const { id } = await params;

        // Verify ownership using correct DB user ID
        const report = await prisma.report.findFirst({
            where: { id, userId: dbUserId }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        await prisma.report.delete({
            where: { id }
        });

        // Audit the deletion
        await logAudit({
            entity: 'Report',
            entityId: id,
            action: 'DELETE',
            changes: { timestamp: report.timestamp, id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting report:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// GET /api/reports/[id] - Get a specific report
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUserId = await getDbUserId(userId);
        const { id } = params;

        const report = await prisma.report.findFirst({
            where: { id, userId: dbUserId }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const response = NextResponse.json({ report });

        // Disable all caching to prevent stale data sync issues
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error: unknown) {
        console.error('Error fetching report:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
