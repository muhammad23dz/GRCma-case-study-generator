import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/reports - Get user's saved assessment reports
export async function GET(request: NextRequest) {
    console.log('[Reports GET] Fetching reports...');

    try {
        // Authenticate via Clerk directly
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({
                error: 'Please sign in to view reports.',
                reports: []
            }, { status: 401 });
        }

        console.log('[Reports GET] Authenticated user:', clerkId);

        // Fetch reports by clerkId (stored as userId in reports)
        const reports = await prisma.report.findMany({
            where: { userId: clerkId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        console.log('[Reports GET] Found', reports.length, 'reports');

        const parsedReports = reports.map(report => ({
            ...report,
            sections: typeof report.sections === 'string' ? JSON.parse(report.sections) : report.sections
        }));

        const response = NextResponse.json({ reports: parsedReports });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;

    } catch (error: any) {
        console.error('[Reports GET] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch reports', reports: [] }, { status: 500 });
    }
}

// POST /api/reports - Save a new assessment report
export async function POST(request: NextRequest) {
    console.log('[Reports POST] Saving report...');

    try {
        // Authenticate via Clerk directly
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({
                error: 'Please sign in to save reports.'
            }, { status: 401 });
        }

        const body = await request.json();
        const { sections } = body;

        if (!sections) {
            return NextResponse.json({ error: 'Report sections are required.' }, { status: 400 });
        }

        // Save report with clerkId as userId
        const report = await prisma.report.create({
            data: {
                userId: clerkId,
                sections: sections
            }
        });

        console.log('[Reports POST] Report saved with ID:', report.id);

        return NextResponse.json({ report, success: true });

    } catch (error: any) {
        console.error('[Reports POST] Error:', error);
        return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }
}
