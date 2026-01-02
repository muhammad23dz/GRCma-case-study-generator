import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/training/[id] - Get single Training Course
export async function GET(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;

        const course = await prisma.trainingCourse.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'TrainingCourse')
            },
            include: {
                assignments: { include: { employee: true } }
            }
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ course });
    } catch (error: any) {
        console.error('Error fetching training course:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// PATCH /api/training/[id] - Update Training Course
export async function PATCH(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const isolationFilter = getIsolationFilter(context, 'TrainingCourse');

        // Verify existence before update
        const existing = await prisma.trainingCourse.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
        }

        const course = await prisma.trainingCourse.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                type: body.type,
                duration: body.duration,
                mandatory: body.mandatory,
                content: body.content,
                passingScore: body.passingScore,
                frequency: body.frequency,
                status: body.status
            }
        });

        return NextResponse.json({ course });
    } catch (error: any) {
        console.error('Error updating training course:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/training/[id] - Delete Training Course
export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'TrainingCourse');

        // Verify existence before delete
        const existing = await prisma.trainingCourse.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
        }

        await prisma.trainingCourse.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Course deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting training course:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
