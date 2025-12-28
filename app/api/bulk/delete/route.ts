import { NextRequest, NextResponse } from 'next/server';
import { safeError } from '@/lib/security';

// Shared logic for deletion with expert-level isolation
async function performDeletion(module: string, ids?: string[]) {
    const { getIsolationContext, getIsolationFilter } = await import('@/lib/isolation');
    const context = await getIsolationContext();
    if (!context) throw new Error('Unauthorized or Organization context missing');

    const { prisma } = await import('@/lib/prisma');

    // Map module name to standard GRC model type for filter resolution
    const modelMapping: Record<string, string> = {
        'controls': 'Control',
        'risks': 'Risk',
        'policies': 'Policy',
        'vendors': 'Vendor',
        'incidents': 'Incident',
        'actions': 'Action',
        'reports': 'Report',
        'assets': 'Asset',
        'bcdrPlans': 'BCDRPlan',
        'employees': 'Employee',
        'trainingCourses': 'TrainingCourse',
        'questionnaires': 'Questionnaire',
        'runbooks': 'Runbook',
        'businessProcesses': 'BusinessProcess',
        'gaps': 'Gap',
        'findings': 'AuditFinding',
        'changes': 'Change'
    };

    const modelType = modelMapping[module] || 'Control';
    const filter = getIsolationFilter(context, modelType);

    // Combine with IDs if provided
    const finalWhere = ids ? { ...filter, id: { in: ids } } : filter;

    console.log(`[Bulk Delete] Deleting from ${module} (Type: ${modelType}) where:`, JSON.stringify(finalWhere));

    let result;
    switch (module) {
        case 'controls':
            result = await prisma.control.deleteMany({ where: finalWhere });
            break;
        case 'risks': result = await prisma.risk.deleteMany({ where: finalWhere }); break;
        case 'policies': result = await prisma.policy.deleteMany({ where: finalWhere }); break;
        case 'vendors': result = await prisma.vendor.deleteMany({ where: finalWhere }); break;
        case 'incidents': result = await prisma.incident.deleteMany({ where: finalWhere }); break;
        case 'actions': result = await prisma.action.deleteMany({ where: finalWhere }); break;
        case 'reports': result = await prisma.report.deleteMany({ where: finalWhere }); break;
        case 'gaps': result = await prisma.gap.deleteMany({ where: finalWhere }); break;
        case 'assets': result = await (prisma as any).asset?.deleteMany?.({ where: finalWhere }); break;
        case 'bcdrPlans': result = await (prisma as any).bCDRPlan?.deleteMany?.({ where: finalWhere }); break;
        case 'employees': result = await (prisma as any).employee?.deleteMany?.({ where: finalWhere }); break;
        case 'trainingCourses': result = await (prisma as any).trainingCourse?.deleteMany?.({ where: finalWhere }); break;
        case 'questionnaires': result = await (prisma as any).questionnaire?.deleteMany?.({ where: finalWhere }); break;
        case 'runbooks': result = await (prisma as any).runbook?.deleteMany?.({ where: finalWhere }); break;
        case 'businessProcesses': result = await (prisma as any).businessProcess?.deleteMany?.({ where: finalWhere }); break;
        case 'findings': result = await (prisma as any).auditFinding?.deleteMany?.({ where: finalWhere }); break;
        case 'changes': result = await (prisma as any).change?.deleteMany?.({ where: finalWhere }); break;
        default: throw new Error(`Unknown module: ${module}`);
    }

    return result?.count || 0;
}

// POST /api/bulk/delete - Bulk delete specific items
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { module, ids } = body;

        if (!module || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Module and ids array required' }, { status: 400 });
        }

        const deleteCount = await performDeletion(module, ids);
        return NextResponse.json({ success: true, deleted: deleteCount, module });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Bulk Delete POST');
        return NextResponse.json({ error: message, code }, { status });
    }
}

// DELETE /api/bulk/delete - Delete all items from a module (Clear Workspace)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');

        if (!module) {
            return NextResponse.json({ error: 'Module parameter required' }, { status: 400 });
        }

        const deleteCount = await performDeletion(module);
        return NextResponse.json({ success: true, deleted: deleteCount, module });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Bulk Delete DELETE');
        return NextResponse.json({ error: message, code }, { status });
    }
}
