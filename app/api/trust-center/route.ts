import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';

// Input Validation
const configSchema = z.object({
    companyName: z.string().min(2).max(200),
    logoUrl: z.string().url().optional().nullable(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#006233'),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C1272D'),
    description: z.string().max(2000).optional(),
    slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
    contactEmail: z.string().email().optional(),
    securityEmail: z.string().email().optional(),
    isPublished: z.boolean().default(false)
});

const sectionSchema = z.object({
    sectionType: z.enum(['overview', 'certifications', 'controls', 'policies', 'updates', 'contact', 'faq']),
    title: z.string().min(2).max(200),
    content: z.string().max(50000),
    displayOrder: z.number().int().min(0).default(0),
    isVisible: z.boolean().default(true),
    icon: z.string().max(50).optional()
});

// GET /api/trust-center - Get org's trust center config
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let config = await prisma.trustCenterConfig.findUnique({
            where: { organizationId: context.orgId },
            include: {
                sections: {
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });

        // If no config exists, return template
        if (!config) {
            return NextResponse.json({
                config: null,
                template: {
                    companyName: '',
                    primaryColor: '#006233',
                    accentColor: '#C1272D',
                    slug: '',
                    sections: [
                        { sectionType: 'overview', title: 'Security Overview', displayOrder: 0 },
                        { sectionType: 'certifications', title: 'Certifications & Compliance', displayOrder: 1 },
                        { sectionType: 'controls', title: 'Security Controls', displayOrder: 2 },
                        { sectionType: 'policies', title: 'Policies', displayOrder: 3 },
                        { sectionType: 'contact', title: 'Contact Security Team', displayOrder: 4 }
                    ]
                }
            });
        }

        return NextResponse.json({ config });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/trust-center - Create or update trust center config
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = configSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const data = parseResult.data;

        // Check if slug is unique (excluding own org)
        const existingSlug = await prisma.trustCenterConfig.findUnique({
            where: { slug: data.slug }
        });

        if (existingSlug && existingSlug.organizationId !== context.orgId) {
            return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
        }

        // Upsert config
        const config = await prisma.trustCenterConfig.upsert({
            where: { organizationId: context.orgId },
            create: {
                organizationId: context.orgId,
                ...data
            },
            update: data
        });

        await logAudit({
            entity: 'TrustCenterConfig',
            entityId: config.id,
            action: 'UPDATE',
            changes: { slug: data.slug, isPublished: data.isPublished }
        });

        return NextResponse.json({ config });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// PUT /api/trust-center?action=section - Add/update section
export async function PUT(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sectionId = searchParams.get('sectionId');

        const body = await request.json();

        const parseResult = sectionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        // Get config
        const config = await prisma.trustCenterConfig.findUnique({
            where: { organizationId: context.orgId }
        });

        if (!config) {
            return NextResponse.json({ error: 'Trust center not configured' }, { status: 404 });
        }

        let section;
        if (sectionId) {
            // Update existing section
            section = await prisma.trustCenterSection.update({
                where: { id: sectionId },
                data: parseResult.data
            });
        } else {
            // Create new section
            section = await prisma.trustCenterSection.create({
                data: {
                    configId: config.id,
                    ...parseResult.data
                }
            });
        }

        await logAudit({
            entity: 'TrustCenterSection',
            entityId: section.id,
            action: sectionId ? 'UPDATE' : 'CREATE',
            changes: { sectionType: section.sectionType, title: section.title }
        });

        return NextResponse.json({ section });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter PUT');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/trust-center?sectionId=xxx - Delete section
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sectionId = searchParams.get('sectionId');

        if (!sectionId) {
            return NextResponse.json({ error: 'sectionId required' }, { status: 400 });
        }

        // Verify section belongs to org
        const section = await prisma.trustCenterSection.findFirst({
            where: { id: sectionId },
            include: { config: true }
        });

        if (!section || section.config.organizationId !== context.orgId) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        await prisma.trustCenterSection.delete({ where: { id: sectionId } });

        await logAudit({
            entity: 'TrustCenterSection',
            entityId: sectionId,
            action: 'DELETE',
            changes: {}
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}
