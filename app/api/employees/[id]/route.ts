import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees/[id] - Get single Employee
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

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                trainings: { include: { course: true } },
                policyAcks: { include: { policy: true } }
            }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.employee.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
