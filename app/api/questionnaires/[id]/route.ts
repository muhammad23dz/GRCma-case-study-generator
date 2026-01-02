import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/questionnaires/[id] - Get single Questionnaire
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

        const questionnaire = await prisma.questionnaire.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Questionnaire')
            },
            include: {
                questions: { orderBy: { order: 'asc' } },
                responses: { include: { answers: true } }
            }
        });

        if (!questionnaire) {
            return NextResponse.json({ error: 'Questionnaire not found or access denied' }, { status: 404 });
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
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const isolationFilter = getIsolationFilter(context, 'Questionnaire');

        // Verify existence before update
        const existing = await prisma.questionnaire.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Questionnaire not found or access denied' }, { status: 404 });
        }

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
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Questionnaire');

        // Verify existence before delete
        const existing = await prisma.questionnaire.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Questionnaire not found or access denied' }, { status: 404 });
        }

        await prisma.questionnaire.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Questionnaire deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting questionnaire:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
