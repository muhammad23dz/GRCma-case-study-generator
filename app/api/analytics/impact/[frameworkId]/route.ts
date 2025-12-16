import { NextRequest, NextResponse } from 'next/server';
import { ImpactService } from '@/lib/analytics/impact';
import { auth } from '@clerk/nextjs/server';

const impactService = new ImpactService();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ frameworkId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { frameworkId } = await params;
        if (!frameworkId) {
            return new NextResponse('Framework ID is required', { status: 400 });
        }

        const impact = await impactService.analyzeFrameworkImpact(frameworkId);

        if (!impact) {
            return new NextResponse('Framework not found', { status: 404 });
        }

        return NextResponse.json(impact);
    } catch (error) {
        console.error('Error analyzing impact:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
