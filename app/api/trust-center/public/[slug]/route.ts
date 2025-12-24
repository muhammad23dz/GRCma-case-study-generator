import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/trust-center/public/[slug] - Public trust center view
// This is a PUBLIC endpoint - no auth required
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        if (!slug) {
            return NextResponse.json({ error: 'Slug required' }, { status: 400 });
        }

        // Find published trust center
        const config = await prisma.trustCenterConfig.findFirst({
            where: {
                slug,
                isPublished: true
            },
            include: {
                sections: {
                    where: { isVisible: true },
                    orderBy: { displayOrder: 'asc' }
                },
                organization: {
                    select: { name: true }
                }
            }
        });

        if (!config) {
            return NextResponse.json({ error: 'Trust center not found' }, { status: 404 });
        }

        // Get public compliance stats (no sensitive data)
        const [controlStats, frameworkStats] = await Promise.all([
            prisma.control.groupBy({
                by: ['controlType'],
                where: { organizationId: config.organizationId },
                _count: true
            }),
            prisma.frameworkMapping.findMany({
                where: {
                    control: { organizationId: config.organizationId }
                },
                select: {
                    framework: { select: { name: true } }
                },
                distinct: ['frameworkId']
            })
        ]);

        // Return public-safe data
        return NextResponse.json({
            company: {
                name: config.companyName,
                logo: config.logoUrl,
                description: config.description
            },
            branding: {
                primaryColor: config.primaryColor,
                accentColor: config.accentColor
            },
            contact: {
                email: config.contactEmail,
                securityEmail: config.securityEmail
            },
            sections: config.sections.map(s => ({
                type: s.sectionType,
                title: s.title,
                content: s.content,
                icon: s.icon
            })),
            stats: {
                controlTypes: controlStats.map(c => ({ type: c.controlType, count: c._count })),
                frameworks: frameworkStats.map(f => f.framework.name)
            }
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter Public');
        return NextResponse.json({ error: message }, { status });
    }
}
