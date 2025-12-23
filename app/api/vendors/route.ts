import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/vendors - List vendors for current user
export async function GET() {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return new NextResponse('Unauthorized', { status: 401 });
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
        const { name, criticality, services, contactEmail, category, riskScore } = body;

        const vendor = await prisma.vendor.create({
            data: {
                name,
                category: category || 'Service Provider',
                criticality: criticality || 'medium',
                services,
                contactEmail,
                owner: context.email,
                organizationId: context.orgId, // Org-scoped IAM support
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
                    organizationId: context.orgId // Inherit org context
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
