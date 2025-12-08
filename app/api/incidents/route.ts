import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/incidents
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const incidents = await prisma.incident.findMany({
            include: {
                actions: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ incidents });
    } catch (error: any) {
        console.error('Error fetching incidents:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/incidents
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, severity, assignedTo } = body;

        const incident = await prisma.incident.create({
            data: {
                title,
                description,
                severity,
                assignedTo,
                reportedBy: session.user.email
            }
        });

        return NextResponse.json({ incident });
    } catch (error: any) {
        console.error('Error creating incident:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
