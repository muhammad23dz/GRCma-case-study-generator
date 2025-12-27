import { NextRequest, NextResponse } from 'next/server';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// POST /api/bulk/delete - Bulk delete items from a module
export async function POST(request: NextRequest) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidDb) {
            console.warn('[Bulk Delete] No valid DATABASE_URL, returning success in demo mode');
            return NextResponse.json({ success: true, deleted: 0, module: 'demo' });
        }

        const { prisma } = await import('@/lib/prisma');
        const body = await request.json();
        const { module, ids } = body;

        if (!module || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Module and ids array required' }, { status: 400 });
        }

        let deleteCount = 0;
        const baseFilter = { id: { in: ids } };

        switch (module) {
            case 'assets':
                const assetResult = await (prisma as any).asset?.deleteMany?.({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = assetResult?.count || 0;
                break;
            case 'bcdrPlans':
                const bcdrResult = await (prisma as any).bCDRPlan?.deleteMany?.({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = bcdrResult?.count || 0;
                break;
            case 'employees':
                const empResult = await (prisma as any).employee?.deleteMany?.({
                    where: { ...baseFilter, organizationId: context.orgId || undefined }
                });
                deleteCount = empResult?.count || 0;
                break;
            case 'trainingCourses':
                const trainResult = await (prisma as any).trainingCourse?.deleteMany?.({
                    where: { ...baseFilter, organizationId: context.orgId || undefined }
                });
                deleteCount = trainResult?.count || 0;
                break;
            case 'questionnaires':
                const questResult = await (prisma as any).questionnaire?.deleteMany?.({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = questResult?.count || 0;
                break;
            case 'runbooks':
                const runResult = await (prisma as any).runbook?.deleteMany?.({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = runResult?.count || 0;
                break;
            case 'businessProcesses':
                const procResult = await (prisma as any).businessProcess?.deleteMany?.({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = procResult?.count || 0;
                break;
            case 'controls':
                const ctrlResult = await prisma.control.deleteMany({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = ctrlResult?.count || 0;
                break;
            case 'risks':
                const riskResult = await prisma.risk.deleteMany({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = riskResult?.count || 0;
                break;
            case 'policies':
                const polResult = await prisma.policy.deleteMany({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = polResult?.count || 0;
                break;
            case 'vendors':
                const vendResult = await prisma.vendor.deleteMany({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = vendResult?.count || 0;
                break;
            case 'incidents':
                const incResult = await prisma.incident.deleteMany({
                    where: { ...baseFilter, reportedBy: context.email }
                });
                deleteCount = incResult?.count || 0;
                break;
            case 'actions':
                const actResult = await prisma.action.deleteMany({
                    where: { ...baseFilter, owner: context.email }
                });
                deleteCount = actResult?.count || 0;
                break;
            case 'reports':
                const repResult = await prisma.report.deleteMany({
                    where: { ...baseFilter, userId: context.userId }
                });
                deleteCount = repResult?.count || 0;
                break;
            default:
                return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            deleted: deleteCount,
            module
        });
    } catch (error: any) {
        console.error('Error in bulk delete:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/bulk/delete - Delete all items from a module
export async function DELETE(request: NextRequest) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasValidDb) {
            console.warn('[Bulk Delete] No valid DATABASE_URL, returning success in demo mode');
            return NextResponse.json({ success: true, deleted: 0, module: 'demo' });
        }

        const { prisma } = await import('@/lib/prisma');
        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');

        if (!module) {
            return NextResponse.json({ error: 'Module parameter required' }, { status: 400 });
        }

        let deleteCount = 0;

        switch (module) {
            case 'assets':
                const assetResult = await (prisma as any).asset?.deleteMany?.({
                    where: { owner: context.email }
                });
                deleteCount = assetResult?.count || 0;
                break;
            case 'bcdrPlans':
                const bcdrResult = await (prisma as any).bCDRPlan?.deleteMany?.({
                    where: { owner: context.email }
                });
                deleteCount = bcdrResult?.count || 0;
                break;
            case 'employees':
                const empResult = await (prisma as any).employee?.deleteMany?.({
                    where: { organizationId: context.orgId || undefined }
                });
                deleteCount = empResult?.count || 0;
                break;
            case 'trainingCourses':
                const trainResult = await (prisma as any).trainingCourse?.deleteMany?.({
                    where: { organizationId: context.orgId || undefined }
                });
                deleteCount = trainResult?.count || 0;
                break;
            case 'questionnaires':
                const questResult = await (prisma as any).questionnaire?.deleteMany?.({
                    where: { owner: context.email }
                });
                deleteCount = questResult?.count || 0;
                break;
            case 'runbooks':
                const runResult = await (prisma as any).runbook?.deleteMany?.({
                    where: { owner: context.email }
                });
                deleteCount = runResult?.count || 0;
                break;
            case 'businessProcesses':
                const procResult = await (prisma as any).businessProcess?.deleteMany?.({
                    where: { owner: context.email }
                });
                deleteCount = procResult?.count || 0;
                break;
            case 'controls':
                const ctrlResult = await prisma.control.deleteMany({
                    where: { owner: context.email }
                });
                deleteCount = ctrlResult?.count || 0;
                break;
            case 'risks':
                const riskResult = await prisma.risk.deleteMany({
                    where: { owner: context.email }
                });
                deleteCount = riskResult?.count || 0;
                break;
            case 'policies':
                const polResult = await prisma.policy.deleteMany({
                    where: { owner: context.email }
                });
                deleteCount = polResult?.count || 0;
                break;
            case 'vendors':
                const vendResult = await prisma.vendor.deleteMany({
                    where: { owner: context.email }
                });
                deleteCount = vendResult?.count || 0;
                break;
            case 'incidents':
                const incResult = await prisma.incident.deleteMany({
                    where: { reportedBy: context.email }
                });
                deleteCount = incResult?.count || 0;
                break;
            case 'actions':
                const actResult = await prisma.action.deleteMany({
                    where: { owner: context.email }
                });
                deleteCount = actResult?.count || 0;
                break;
            case 'reports':
                const delRepResult = await prisma.report.deleteMany({
                    where: { userId: context.userId }
                });
                deleteCount = delRepResult?.count || 0;
                break;
            default:
                return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            deleted: deleteCount,
            module
        });
    } catch (error: any) {
        console.error('Error in delete all:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
