import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { z } from 'zod';

// Input Validation Schema
const createVendorSchema = z.object({
    name: z.string().min(2, "Name too short").max(200, "Name too long"),
    criticality: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    services: z.string().max(1000).optional(),
    contactEmail: z.string().email("Invalid contact email").optional(),
    category: z.string().max(100).default('Service Provider'),
    riskScore: z.number().int().min(0).max(100).default(50)
});

// GET /api/vendors - List vendors for current user
export async function GET() {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Expert Tier Isolation
        const vendors = await prisma.vendor.findMany({
            where: {
                ...getIsolationFilter(context, 'Vendor')
            },
            include: {
                vendorRisks: {
                    include: {
                        risk: true
                    }
                },
                _count: {
                    select: { assessments: true, evidences: true }
                }
            },
            orderBy: { riskScore: 'desc' }
        });

        return NextResponse.json({ vendors });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Vendors GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/vendors - Create new vendor with risk assessment
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate input
        const parseResult = createVendorSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { name, criticality, services, contactEmail, category, riskScore } = parseResult.data;

        const vendor = await prisma.vendor.create({
            data: {
                name,
                category: category || 'Service Provider',
                criticality: criticality || 'medium',
                services,
                contactEmail,
                owner: context.email,
                organizationId: context.orgId || undefined, // Org-scoped IAM support
                status: 'active',
                riskScore: riskScore || 50
            }
        });

        // GRC Automation: Create vendor risk assessment if high criticality
        if (criticality === 'high' || criticality === 'critical') {
            const vendorRisk = await prisma.risk.create({
                data: {
                    category: 'Third-Party',
                    narrative: `Third-party risk for ${name}: ${services || 'various services'}. Vendor criticality: ${criticality}.`,
                    likelihood: criticality === 'critical' ? 4 : 3,
                    impact: criticality === 'critical' ? 4 : 3,
                    score: criticality === 'critical' ? 16 : 9,
                    status: 'open',
                    owner: context.email,
                    organizationId: context.orgId || undefined // Inherit org context
                }
            });

            await prisma.vendorRisk.create({
                data: {
                    vendorId: vendor.id,
                    riskId: vendorRisk.id,
                    riskType: 'security'
                }
            });
        }

        return NextResponse.json({ vendor }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Vendors POST');
        return NextResponse.json({ error: message }, { status });
    }
}
