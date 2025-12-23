import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/training - List Training Courses
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const courses = await prisma.trainingCourse.findMany({
            include: {
                _count: {
                    select: { assignments: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ courses });
    } catch (error: any) {
        console.error('Error fetching training courses:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/training - Create Training Course
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, type, duration, mandatory, content, passingScore, frequency } = body;

        const course = await prisma.trainingCourse.create({
            data: {
                title,
                description,
                type: type || 'security_awareness',
                duration,
                mandatory: mandatory || false,
                content,
                passingScore: passingScore || 80.0,
                frequency,
                status: 'active'
            }
        });

        return NextResponse.json({ course }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating training course:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
