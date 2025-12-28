import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET /api/evidence - List all evidence for the organization
export async function GET(request: Request) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlId = searchParams.get('controlId');
        const riskId = searchParams.get('riskId');
        const requirementId = searchParams.get('requirementId');

        // Use standard isolation filter
        const filter = getIsolationFilter(context, 'Evidence');

        const whereClause: any = { ...filter };
        if (controlId) whereClause.controlId = controlId;
        if (riskId) whereClause.riskId = riskId;
        if (requirementId) whereClause.requirementId = requirementId;

        const evidenceList = await prisma.evidence.findMany({
            where: whereClause,
            include: {
                control: { select: { id: true, title: true } },
                risk: { select: { id: true, narrative: true } },
                requirement: {
                    include: {
                        framework: { select: { id: true, name: true } }
                    }
                },
                controlTests: true,
            },
            orderBy: { timestamp: 'desc' }
        });

        return NextResponse.json({ data: evidenceList });
    } catch (error: unknown) {
        const { message, status, code } = safeError(error, 'Evidence GET');
        return NextResponse.json({ error: message, code }, { status });
    }
}

// POST /api/evidence - Create evidence with file upload
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const controlId = formData.get('controlId') as string | null;
        const riskId = formData.get('riskId') as string | null;
        const requirementId = formData.get('requirementId') as string | null;
        const evidenceType = formData.get('evidenceType') as string || 'document';
        const source = formData.get('source') as string || 'manual';
        const description = formData.get('description') as string || '';

        let fileUrl = null;
        let fileName = null;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            fileName = `${timestamp}-${safeName}`;

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'evidence');

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            const path = join(uploadDir, fileName);
            await writeFile(path, buffer);

            fileUrl = `/uploads/evidence/${fileName}`;
        }

        // Fetch settings for default review cycle
        const reviewCycleSetting = await prisma.systemSetting.findUnique({
            where: { userId_key: { userId: context.userId, key: 'compliance_evidenceReviewCycle' } }
        });
        const reviewDays = parseInt(reviewCycleSetting?.value || '30');
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + reviewDays);

        const evidence = await prisma.evidence.create({
            data: {
                controlId: controlId || undefined,
                riskId: riskId || undefined,
                requirementId: requirementId || undefined,
                evidenceType,
                source,
                auditPeriod: formData.get('auditPeriod') as string || null,
                description,
                fileName,
                fileUrl,
                uploadedBy: context.email || context.userId,
                organizationId: context.orgId,
                status: 'draft',
                nextReviewDate
            }
        });

        return NextResponse.json({ data: evidence });
    } catch (error: unknown) {
        const { message, status, code } = safeError(error, 'Evidence POST');
        return NextResponse.json({ error: message, code }, { status });
    }
}
