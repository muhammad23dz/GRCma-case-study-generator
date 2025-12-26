import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import crypto from 'crypto';

// Generate unique certificate number
function generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CERT-${year}-${random}`;
}

// GET /api/training/certificates - List certificates
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const courseId = searchParams.get('courseId');

        const whereClause: any = {
            organizationId: context.orgId || undefined
        };

        if (employeeId) whereClause.employeeId = employeeId;
        if (courseId) whereClause.courseId = courseId;

        const certificates = await prisma.trainingCertificate.findMany({
            where: whereClause,
            orderBy: { issuedAt: 'desc' }
        });

        return NextResponse.json({ certificates });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Certificates GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/training/certificates - Issue certificate (auto on completion)
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assignmentId } = body;

        if (!assignmentId) {
            return NextResponse.json({ error: 'assignmentId required' }, { status: 400 });
        }

        // Get assignment with course and employee
        const assignment = await prisma.trainingAssignment.findFirst({
            where: { id: assignmentId },
            include: {
                course: true,
                employee: true
            }
        });

        if (!assignment) {
            return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
        }

        if (assignment.status !== 'completed') {
            return NextResponse.json({ error: 'Training not completed' }, { status: 400 });
        }

        if (!assignment.score || assignment.score < assignment.course.passingScore) {
            return NextResponse.json({ error: 'Score below passing threshold' }, { status: 400 });
        }

        // Check if certificate already exists
        const existing = await prisma.trainingCertificate.findUnique({
            where: { assignmentId }
        });

        if (existing) {
            return NextResponse.json({ certificate: existing });
        }

        // Calculate expiry based on course frequency
        let expiresAt: Date | null = null;
        if (assignment.course.frequency) {
            const now = new Date();
            switch (assignment.course.frequency) {
                case 'annual':
                    expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
                    break;
                case 'quarterly':
                    expiresAt = new Date(now.setMonth(now.getMonth() + 3));
                    break;
                case 'monthly':
                    expiresAt = new Date(now.setMonth(now.getMonth() + 1));
                    break;
            }
        }

        // Generate certificate
        const certNumber = generateCertificateNumber();
        const certificate = await prisma.trainingCertificate.create({
            data: {
                assignmentId,
                employeeId: assignment.employeeId,
                courseId: assignment.courseId,
                certificateNumber: certNumber,
                employeeName: assignment.employee.name,
                courseName: assignment.course.title,
                score: assignment.score,
                expiresAt,
                verificationUrl: `/verify/certificate/${certNumber}`,
                organizationId: context.orgId || undefined
            }
        });

        await logAudit({
            entity: 'TrainingCertificate',
            entityId: certificate.id,
            action: 'CREATE',
            changes: { certificateNumber: certNumber, courseName: assignment.course.title }
        });

        return NextResponse.json({ certificate }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Certificates POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/training/certificates?id=xxx - Revoke certificate
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const reason = searchParams.get('reason') || 'Revoked by administrator';

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const certificate = await prisma.trainingCertificate.findFirst({
            where: { id, organizationId: context.orgId || undefined }
        });

        if (!certificate) {
            return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        await prisma.trainingCertificate.update({
            where: { id },
            data: {
                isValid: false,
                revokedAt: new Date(),
                revokedReason: reason
            }
        });

        await logAudit({
            entity: 'TrainingCertificate',
            entityId: id,
            action: 'DELETE',
            changes: { revoked: true, reason }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Certificates DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}
