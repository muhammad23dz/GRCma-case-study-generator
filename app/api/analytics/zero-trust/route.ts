import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        // Base filter for user-owned or organization-owned data
        const filters = userEmail ? {
            OR: [
                { owner: userEmail },
                { organization: { users: { some: { id: userId } } } }
            ]
        } : {};

        // Incident uses reportedBy instead of owner in the schema
        const incidentFilters = userEmail ? {
            OR: [
                { reportedBy: userEmail },
                { organization: { users: { some: { id: userId } } } }
            ]
        } : {};

        // Change uses requestedBy instead of owner
        const changeFilters = userEmail ? {
            OR: [
                { requestedBy: userEmail },
                { organization: { users: { some: { id: userId } } } }
            ]
        } : {};

        // Evidence uses uploadedBy instead of owner
        const evidenceFilters = userEmail ? {
            OR: [
                { uploadedBy: userEmail },
                { organization: { users: { some: { id: userId } } } }
            ]
        } : {};

        // Fetch all relevant data components
        const [risks, controls, vendors, incidents, changes, evidence] = await Promise.all([
            prisma.risk.findMany({
                where: filters,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.control.findMany({
                where: filters,
                include: {
                    controlTests: {
                        orderBy: { testDate: 'desc' },
                        take: 1
                    }
                }
            }),
            prisma.vendor.findMany({
                where: filters
            }),
            prisma.incident.findMany({
                where: incidentFilters
            }),
            prisma.change.findMany({
                where: changeFilters
            }),
            prisma.evidence.findMany({
                where: evidenceFilters
            })
        ]);

        // Smart Logic: Categorize GRC entities into Zero Trust Pillars
        const categorize = (text: string): string[] => {
            const categories: string[] = [];
            const t = text.toLowerCase();
            if (t.includes('mfa') || t.includes('identity') || t.includes('auth') || t.includes('user') || t.includes('access')) categories.push('identity');
            if (t.includes('device') || t.includes('endpoint') || t.includes('mobile') || t.includes('laptop') || t.includes('workstation') || t.includes('mdm')) categories.push('device');
            if (t.includes('network') || t.includes('firewall') || t.includes('segment') || t.includes('vpn') || t.includes('traffic') || t.includes('ztna')) categories.push('network');
            if (t.includes('application') || t.includes('api') || t.includes('container') || t.includes('microservice') || t.includes('saas')) categories.push('application');
            if (t.includes('data') || t.includes('encryption') || t.includes('database') || t.includes('backup') || t.includes('privacy')) categories.push('data');
            return categories;
        };

        const identityRisks = risks.filter(r => categorize(`${r.narrative} ${r.category}`).includes('identity'));
        const deviceRisks = risks.filter(r => categorize(`${r.narrative} ${r.category}`).includes('device'));
        const networkRisks = risks.filter(r => categorize(`${r.narrative} ${r.category}`).includes('network'));
        const appRisks = risks.filter(r => categorize(`${r.narrative} ${r.category}`).includes('application'));
        const dataRisks = risks.filter(r => categorize(`${r.narrative} ${r.category}`).includes('data'));

        const identityControls = controls.filter(c => categorize(`${c.title} ${c.description || ''}`).includes('identity'));
        const deviceControls = controls.filter(c => categorize(`${c.title} ${c.description || ''}`).includes('device'));
        const networkControls = controls.filter(c => categorize(`${c.title} ${c.description || ''}`).includes('network'));
        const appControls = controls.filter(c => categorize(`${c.title} ${c.description || ''}`).includes('application'));
        const dataControls = controls.filter(c => categorize(`${c.title} ${c.description || ''}`).includes('data'));

        // Scoring engine: Considers (Risk Avg) + (Mitigation Bonus) + (Test Compliance)
        const calculatePillarScore = (pillarRisks: any[], pillarControls: any[], bonus: number = 0) => {
            const riskDeduction = pillarRisks.length > 0
                ? (pillarRisks.reduce((sum, r) => sum + (r.score || 50), 0) / pillarRisks.length)
                : 0;

            const compliantControls = pillarControls.filter(c => c.controlTests[0]?.result === 'pass').length;
            const complianceBonus = pillarControls.length > 0 ? (compliantControls / pillarControls.length) * 30 : 15;

            const rawScore = 80 - riskDeduction + complianceBonus + bonus;
            return Math.max(10, Math.min(100, Math.round(rawScore)));
        };

        const getStatus = (score: number, issues: number) => {
            if (score < 40 || issues > 5) return 'critical';
            if (score < 70 || issues > 2) return 'warning';
            return 'healthy';
        };

        const metrics = {
            identity: {
                score: calculatePillarScore(identityRisks, identityControls),
                issues: identityRisks.filter(r => r.status === 'open').length,
                controls: identityControls.length,
                status: 'healthy', // placeholder updated later
                recentRisks: identityRisks.slice(0, 3).map(r => r.narrative)
            },
            device: {
                score: calculatePillarScore(deviceRisks, deviceControls, vendors.length > 0 ? 10 : 0),
                issues: deviceRisks.filter(r => r.status === 'open').length + vendors.filter(v => (v.riskScore || 0) > 60).length,
                vendors: vendors.length,
                status: 'healthy',
                recentRisks: deviceRisks.slice(0, 3).map(r => r.narrative)
            },
            network: {
                score: calculatePillarScore(networkRisks, networkControls),
                issues: networkRisks.filter(r => r.status === 'open').length,
                controls: networkControls.length,
                status: 'healthy',
                recentRisks: networkRisks.slice(0, 3).map(r => r.narrative)
            },
            application: {
                score: calculatePillarScore(appRisks, appControls, (changes.length > 0 ? 5 : 0) - (incidents.length > 0 ? 10 : 0)),
                issues: appRisks.filter(r => r.status === 'open').length + incidents.filter(i => i.status !== 'resolved').length,
                changes: changes.length,
                status: 'healthy',
                recentRisks: appRisks.slice(0, 3).map(r => r.narrative)
            },
            data: {
                score: calculatePillarScore(dataRisks, dataControls, evidence.length > 0 ? 10 : 0),
                issues: dataRisks.filter(r => r.status === 'open').length,
                evidence: evidence.length,
                status: 'healthy',
                recentRisks: dataRisks.slice(0, 3).map(r => r.narrative)
            }
        };

        // Finalize statuses
        metrics.identity.status = getStatus(metrics.identity.score, metrics.identity.issues);
        metrics.device.status = getStatus(metrics.device.score, metrics.device.issues);
        metrics.network.status = getStatus(metrics.network.score, metrics.network.issues);
        metrics.application.status = getStatus(metrics.application.score, metrics.application.issues);
        metrics.data.status = getStatus(metrics.data.score, metrics.data.issues);

        return NextResponse.json({
            success: true,
            pillars: metrics
        });

    } catch (error: any) {
        console.error('Zero Trust metrics error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
