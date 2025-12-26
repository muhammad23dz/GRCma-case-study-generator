import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/training/certificates/verify/[number] - Public verification
// No auth required - public certificate verification
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ number: string }> }
) {
    try {
        const { number } = await params;

        if (!number) {
            return NextResponse.json({ error: 'Certificate number required' }, { status: 400 });
        }

        const certificate = await prisma.trainingCertificate.findUnique({
            where: { certificateNumber: number }
        });

        if (!certificate) {
            return NextResponse.json({
                valid: false,
                error: 'Certificate not found'
            }, { status: 404 });
        }

        // Check validity
        const isExpired = certificate.expiresAt && new Date() > certificate.expiresAt;
        const isRevoked = !certificate.isValid;

        return NextResponse.json({
            valid: certificate.isValid && !isExpired,
            certificate: {
                certificateNumber: certificate.certificateNumber,
                employeeName: certificate.employeeName,
                courseName: certificate.courseName,
                score: certificate.score,
                issuedAt: certificate.issuedAt,
                expiresAt: certificate.expiresAt,
                isExpired,
                isRevoked,
                revokedReason: isRevoked ? certificate.revokedReason : null
            }
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Certificate Verify');
        return NextResponse.json({ error: message }, { status });
    }
}
