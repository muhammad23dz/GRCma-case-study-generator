import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit/workpapers - List Audit Workpapers (Evidence linked to audits)
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const auditId = searchParams.get('auditId');

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Get evidence that's linked to audits
        const evidence = await prisma.evidence.findMany({
            where: {
                uploadedBy: userEmail,
                organizationId: orgId || undefined
            },
            include: {
                control: { select: { id: true, title: true } },
                requirement: { select: { id: true, title: true, requirementId: true } }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Get audits for context
        const audits = await prisma.audit.findMany({
            where: {
                OR: [
                    { auditorName: userEmail },
                    { organizationId: orgId || undefined }
                ]
            },
            select: {
                id: true,
                title: true,
                status: true,
                startDate: true,
                endDate: true
            }
        });

        // Organize as workpapers
        const workpapers = evidence.map(e => ({
            id: e.id,
            title: e.fileName || e.description || 'Untitled Evidence',
            description: e.description,
            type: e.evidenceType,
            source: e.source,
            status: e.status,
            uploadedAt: e.timestamp,
            validUntil: e.nextReviewDate,
            linkedControl: e.control,
            linkedRequirement: e.requirement,
            fileUrl: e.fileUrl,
            tags: null
        }));

        return NextResponse.json({
            workpapers,
            audits,
            summary: {
                total: workpapers.length,
                byStatus: {
                    current: workpapers.filter(w => w.status === 'current').length,
                    pending: workpapers.filter(w => w.status === 'pending_review').length,
                    expired: workpapers.filter(w => w.status === 'expired').length
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching audit workpapers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/audit/workpapers - Create Workpaper (Wrapper for evidence upload)
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { title, description, type, source, controlId, requirementId, fileUrl, auditId } = body;

        const evidence = await prisma.evidence.create({
            data: {
                fileName: title,
                description,
                evidenceType: type || 'document',
                source: source || 'manual',
                status: 'under_review',
                fileUrl,
                controlId,
                requirementId,
                uploadedBy: userEmail,
                organizationId: orgId || undefined
            }
        });

        return NextResponse.json({ workpaper: evidence }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating audit workpaper:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
