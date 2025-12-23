import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const { userId } = await auth();

    // 1. Authenticated User Check (DB Based - Persistent)
    if (userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { hasUsedDemo: true, email: true }
        });

        if (user?.hasUsedDemo) {
            return NextResponse.json({
                error: 'Demo limit reached',
                code: 'DEMO_LIMIT_EXCEEDED'
            }, { status: 403 });
        }

        // Mark as used - use the user's email from DB
        if (user?.email) {
            await prisma.user.update({
                where: { email: user.email },
                data: { hasUsedDemo: true }
            });
        }
    }

    // 2. Anonymous User Check (Cookie Based - Browser Specific)
    const hasTried = cookieStore.get('grc_has_tried_demo');

    // If anonymous (no userId) and has cookie, block
    if (!userId && hasTried) {
        return NextResponse.json({
            error: 'Demo limit reached',
            code: 'DEMO_LIMIT_EXCEEDED'
        }, { status: 403 });
    }

    // Create response
    const response = NextResponse.json({ success: true });

    // Set Session Cookie (Short Term - e.g., 1 hour)
    response.cookies.set('grc_demo_session', 'active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    // Set Persistent "Has Tried" Cookie (Long Term)
    response.cookies.set('grc_has_tried_demo', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    });

    return response;
}
