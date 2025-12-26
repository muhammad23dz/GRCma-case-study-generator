import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';

// Input Validation
const templateSchema = z.object({
    name: z.string().min(3).max(200),
    subject: z.string().min(5).max(200),
    senderName: z.string().min(2).max(100),
    senderEmail: z.string().email(),
    htmlContent: z.string().min(50).max(100000),
    landingPageHtml: z.string().max(100000).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    category: z.enum(['credential_harvest', 'malware_link', 'data_disclosure', 'urgent_request'])
});

// GET /api/phishing/templates - List templates
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');

        const whereClause: any = {
            organizationId: context.orgId || undefined,
            isActive: true
        };

        if (category) whereClause.category = category;
        if (difficulty) whereClause.difficulty = difficulty;

        const templates = await prisma.phishingTemplate.findMany({
            where: whereClause,
            include: {
                _count: { select: { campaigns: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ templates });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingTemplates GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/phishing/templates - Create template
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = templateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const data = parseResult.data;

        const template = await prisma.phishingTemplate.create({
            data: {
                ...data,
                createdBy: context.email,
                organizationId: context.orgId || undefined
            }
        });

        await logAudit({
            entity: 'PhishingTemplate',
            entityId: template.id,
            action: 'CREATE',
            changes: { name: data.name, category: data.category }
        });

        return NextResponse.json({ template }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingTemplates POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/phishing/templates?id=xxx - Deactivate template
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const existing = await prisma.phishingTemplate.findFirst({
            where: { id, organizationId: context.orgId || undefined }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        await prisma.phishingTemplate.update({
            where: { id },
            data: { isActive: false }
        });

        await logAudit({
            entity: 'PhishingTemplate',
            entityId: id,
            action: 'DELETE',
            changes: { deactivated: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingTemplates DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}

// Seed default templates
export const defaultPhishingTemplates = [
    {
        name: 'Password Expiry Alert',
        subject: 'URGENT: Your password will expire in 24 hours',
        senderName: 'IT Security',
        senderEmail: 'security@company-it.com',
        htmlContent: `<p>Dear Employee,</p>
<p>Your corporate password will expire in <strong>24 hours</strong>. To avoid disruption, please update your password immediately.</p>
<p><a href="{{PHISHING_LINK}}" style="padding: 10px 20px; background: #0066cc; color: white; text-decoration: none;">Update Password Now</a></p>
<p>If you do not update your password, you will be locked out of all systems.</p>
<p>IT Security Team</p>`,
        difficulty: 'easy',
        category: 'credential_harvest'
    },
    {
        name: 'Document Shared via OneDrive',
        subject: 'John Smith shared "Q4 Budget Proposal.xlsx" with you',
        senderName: 'Microsoft OneDrive',
        senderEmail: 'no-reply@onedrive-share.com',
        htmlContent: `<p>John Smith has shared a file with you.</p>
<p><strong>Q4 Budget Proposal.xlsx</strong></p>
<p><a href="{{PHISHING_LINK}}">Open in OneDrive</a></p>
<p>This link will expire in 7 days.</p>`,
        difficulty: 'medium',
        category: 'credential_harvest'
    },
    {
        name: 'Urgent Invoice Payment',
        subject: 'URGENT: Invoice #INV-2024-9982 - Payment Required',
        senderName: 'Accounts Payable',
        senderEmail: 'accounts@vendor-invoicing.com',
        htmlContent: `<p>Dear Accounting Team,</p>
<p>This is a reminder that invoice #INV-2024-9982 is overdue. Immediate payment is required to avoid service disruption.</p>
<p>Amount: $12,450.00</p>
<p><a href="{{PHISHING_LINK}}">View Invoice & Pay Now</a></p>
<p>Please process this payment today.</p>`,
        difficulty: 'hard',
        category: 'urgent_request'
    }
];
