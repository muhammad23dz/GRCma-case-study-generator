import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/questionnaires/[id] - Get single Questionnaire
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const questionnaire = await prisma.questionnaire.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
                responses: { include: { answers: true } }
            }
        });

        if (!questionnaire) {
            return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
        }

        return NextResponse.json({ questionnaire });
    } catch (error: any) {
        console.error('Error fetching questionnaire:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/questionnaires/[id] - Update Questionnaire
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const questionnaire = await prisma.questionnaire.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                type: body.type,
                status: body.status,
                version: body.version
            }
        });

        return NextResponse.json({ questionnaire });
    } catch (error: any) {
        console.error('Error updating questionnaire:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/questionnaires/[id] - Delete Questionnaire
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.questionnaire.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Questionnaire deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting questionnaire:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
