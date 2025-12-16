import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/changes
export async function GET() {
    try {
        const { userId, sessionClaims } = auth(); // Get userId and sessionClaims from Clerk
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Assuming user role is stored in sessionClaims (e.g., as 'metadata.role')
        // You might need to adjust this based on how you store roles in Clerk
        const userRole = (sessionClaims as any)?.metadata?.role || 'user';
        const isAdmin = ['admin', 'manager'].includes(userRole);

        // For requestedBy, we need the user's email. Clerk's auth() doesn't directly provide it.
        // You would typically fetch the user details from Clerk's API using userId
        // or ensure the email is available in sessionClaims if you've configured it.
        // For now, we'll assume the email can be derived or is available.
        // If not, you'd need to fetch it: const user = await clerkClient.users.getUser(userId);
        // For this example, let's assume we can get an email from sessionClaims or a placeholder.
        const userEmail = (sessionClaims as any)?.email_address || 'unknown@example.com'; // Placeholder or actual email from claims

        const whereClause = isAdmin ? {} : { requestedBy: userEmail };

        const changes = await prisma.change.findMany({
            where: whereClause,
            include: {
                approvals: true,
                risks: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ changes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/changes
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // RBAC Check: All Authenticated Users can CREATE changes (Self-Service)
        // We only block completely unauthenticated users (handled above)
        // Managers/Admins will then process them.

        const body = await request.json();

        // Auto-generate Change Number
        const year = new Date().getFullYear();
        const count = await prisma.change.count();
        const changeNumber = `CHG-${year}-${(count + 1).toString().padStart(3, '0')}`;

        // Basic Risk Calculation
        const { impactLevel, urgency, complexity } = body;
        const impactScore = impactLevel === 'high' ? 5 : impactLevel === 'medium' ? 3 : 1;
        const urgencyScore = urgency === 'critical' ? 5 : urgency === 'high' ? 4 : urgency === 'medium' ? 3 : 2;
        const complexityScore = complexity === 'complex' ? 5 : complexity === 'moderate' ? 3 : 1;

        const riskScore = impactScore * urgencyScore * complexityScore;

        const change = await prisma.change.create({
            data: {
                changeNumber,
                title: body.title,
                description: body.description,
                justification: body.justification,
                changeType: body.changeType,
                category: body.category,
                priority: body.priority,
                impactLevel,
                urgency,
                complexity,
                riskScore,
                requestedDate: new Date(body.requestedDate),
                implementationPlan: body.implementationPlan,
                backoutPlan: body.backoutPlan,
                affectedSystems: JSON.stringify(body.affectedSystems || []),
                currentStage: 'assessment', // Initial stage
                requestedBy: session.user.email,
            }
        });

        // GRC Automation: Auto-create Risk if Score is High (>12)
        if (riskScore > 12) {
            const { createChangeRisk } = await import('@/lib/grc-automation');
            await createChangeRisk(change.id, riskScore);
        }

        return NextResponse.json({ change }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating change:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
