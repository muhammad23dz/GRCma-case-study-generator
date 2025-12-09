import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// GET /api/evidence - List all evidence
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlId = searchParams.get('controlId');
        const riskId = searchParams.get('riskId');
        const requirementId = searchParams.get('requirementId');

        const evidence = await prisma.evidence.findMany({
            where: {
                ...(controlId && { controlId }),
                ...(riskId && { riskId }),
                ...(requirementId && { requirementId }),
            },
            include: {
                control: true,
                risk: true,
                requirement: {
                    include: {
                        framework: true
                    }
                },
            },
            orderBy: { timestamp: 'desc' }
        });

        return NextResponse.json({ evidence });
    } catch (error: any) {
        console.error('Error fetching evidence:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/evidence - Create evidence with file upload
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const controlId = formData.get('controlId') as string | null;
        const riskId = formData.get('riskId') as string | null;
        const requirementId = formData.get('requirementId') as string | null;
        const evidenceType = formData.get('evidenceType') as string;
        const source = formData.get('source') as string || 'manual';
        const description = formData.get('description') as string || '';

        let fileUrl = null;
        let fileName = null;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const timestamp = Date.now();
            fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
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
                uploadedBy: session.user.email,
                status: 'draft', // Default status
            }
        });

        return NextResponse.json({ evidence });
    } catch (error: any) {
        console.error('Error creating evidence:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
