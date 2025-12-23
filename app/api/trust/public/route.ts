import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError, checkRateLimit, getClientIP } from '@/lib/security';

// GET /api/trust/public - Public Trust Center Data
export async function GET(request: NextRequest) {
    try {
        // Rate limit: 30 requests per minute per IP for public endpoint
        const clientIP = getClientIP(request);
        const isAllowed = checkRateLimit(clientIP, 30, 60000);
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }
        // This endpoint can be partially public
        const { searchParams } = new URL(request.url);
        const organizationSlug = searchParams.get('org');

        // Get public compliance stats
        const controls = await prisma.control.findMany({
            select: {
                id: true,
                controlType: true,
                mappings: {
                    select: {
                        framework: { select: { name: true } }
                    }
                }
            }
        });

        const frameworks = await prisma.framework.findMany({
            include: {
                requirements: {
                    select: { id: true }
                },
                mappings: {
                    select: { id: true }
                }
            }
        });

        // Calculate compliance by framework
        const frameworkCompliance = frameworks.map(fw => {
            const totalReqs = fw.requirements.length;
            const mappedReqs = fw.mappings.length;
            const coverage = totalReqs > 0 ? Math.round(mappedReqs / totalReqs * 100) : 0;

            return {
                name: fw.name,
                version: fw.version,
                coverage,
                totalRequirements: totalReqs,
                mappedControls: mappedReqs
            };
        });

        // Get trust requests status
        const trustRequests = await prisma.trustRequest.findMany({
            where: { status: 'pending' },
            select: { id: true }
        });

        // Get recent policies (public titles only)
        const policies = await prisma.policy.findMany({
            where: { status: 'active' },
            select: {
                id: true,
                title: true,
                version: true,
                updatedAt: true
            },
            take: 10,
            orderBy: { updatedAt: 'desc' }
        });

        // Get certifications (from evidence with evidenceType 'certification')
        const certifications = await prisma.evidence.findMany({
            where: {
                evidenceType: 'certification',
                status: 'approved'
            },
            select: {
                id: true,
                fileName: true,
                description: true,
                nextReviewDate: true
            }
        });

        return NextResponse.json({
            trustCenter: {
                lastUpdated: new Date().toISOString(),
                summary: {
                    totalControls: controls.length,
                    totalFrameworks: frameworks.length,
                    overallCompliance: frameworkCompliance.length > 0
                        ? Math.round(frameworkCompliance.reduce((a, f) => a + f.coverage, 0) / frameworkCompliance.length)
                        : 0,
                    pendingAccessRequests: trustRequests.length
                },
                frameworks: frameworkCompliance,
                policies: policies.map(p => ({
                    title: p.title,
                    version: p.version,
                    lastUpdated: p.updatedAt
                })),
                certifications: certifications.map(c => ({
                    name: c.fileName || c.description || 'Certification',
                    validUntil: c.nextReviewDate
                })),
                securityMeasures: [
                    'End-to-end encryption',
                    'SOC 2 Type II certified infrastructure',
                    'Regular penetration testing',
                    'Continuous monitoring',
                    '24/7 incident response',
                    'Data residency options'
                ]
            }
        });
    } catch (error: unknown) {
        console.error('Error getting trust center data:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/trust/public - Submit Trust Center Access Request
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 10 requests per minute per IP for submissions
        const clientIP = getClientIP(request);
        const isAllowed = checkRateLimit(`post:${clientIP}`, 10, 60000);
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, company, reason } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Get IP address for audit
        const ipAddress = clientIP;

        const trustRequest = await prisma.trustRequest.create({
            data: {
                email,
                company,
                reason,
                ipAddress,
                status: 'pending'
            }
        });

        return NextResponse.json({
            message: 'Access request submitted successfully',
            requestId: trustRequest.id
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating trust request:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
