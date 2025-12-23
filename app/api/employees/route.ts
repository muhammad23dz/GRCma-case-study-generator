import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/employees - List Employees
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const employees = await prisma.employee.findMany({
            include: {
                _count: {
                    select: { trainings: true, policyAcks: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ employees });
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/employees - Create Employee
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, name, department, role, manager, hireDate } = body;

        const employee = await prisma.employee.create({
            data: {
                email,
                name,
                department,
                role,
                manager,
                hireDate: hireDate ? new Date(hireDate) : null,
                status: 'active'
            }
        });

        return NextResponse.json({ employee }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating employee:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
