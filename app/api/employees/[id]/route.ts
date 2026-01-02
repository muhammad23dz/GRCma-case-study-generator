import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/employees/[id] - Get single Employee
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

        const employee = await prisma.employee.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Employee')
            },
            include: {
                trainings: { include: { course: true } },
                policyAcks: { include: { policy: true } }
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ employee });
    } catch (error: any) {
        console.error('Error fetching employee:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/employees/[id] - Update Employee
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
        const isolationFilter = getIsolationFilter(context, 'Employee');

        // Verify existence before update
        const existing = await prisma.employee.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 });
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                name: body.name,
                email: body.email,
                department: body.department,
                role: body.role,
                manager: body.manager,
                status: body.status
            }
        });

        return NextResponse.json({ employee });
    } catch (error: any) {
        console.error('Error updating employee:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/employees/[id] - Delete Employee
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
        const isolationFilter = getIsolationFilter(context, 'Employee');

        // Verify existence before delete
        const existing = await prisma.employee.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 });
        }

        await prisma.employee.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
