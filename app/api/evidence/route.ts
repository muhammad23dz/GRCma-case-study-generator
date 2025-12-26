import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET /api/evidence - List all evidence
export async function GET(request: Request) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlId = searchParams.get('controlId');
        const riskId = searchParams.get('riskId');
        const requirementId = searchParams.get('requirementId');

        // Filter by orgId if available
        const whereClause: any = {};
        if (process.env.DEV_MODE !== 'true' && orgId) {
            whereClause.organizationId = orgId;
        }

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
        console.error('Error fetching evidence:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/evidence - Create evidence with file upload
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
                uploadedBy: userId, // Use Clerk userId
                organizationId: orgId || undefined, // Set orgId
                status: 'draft',
            }
        });

        return NextResponse.json({ data: evidence });
    } catch (error: unknown) {
        console.error('Error creating evidence:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
