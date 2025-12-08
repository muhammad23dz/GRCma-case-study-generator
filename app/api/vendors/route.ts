import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/vendors - List all vendors
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendors = await prisma.vendor.findMany({
            include: {
                _count: {
                    select: { assessments: true, evidences: true }
                }
            },
            orderBy: { riskScore: 'desc' }
        });

        return NextResponse.json({ vendors });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, criticality, services, contactEmail } = body;

        const vendor = await prisma.vendor.create({
            data: {
                name,
                criticality,
                services,
                contactEmail
            }
        });

        return NextResponse.json({ vendor }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
