import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/zero-trust
// Returns Zero Trust metrics based on real platform data
export async function GET() {
    try {
        // Fetch all relevant data
        const [risks, controls, vendors, incidents, changes, evidence] = await Promise.all([
            prisma.risk.findMany({
                select: {
                    id: true,
                    narrative: true,
                    assetId: true,
                    category: true,
                    score: true,
                    status: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.control.findMany({
                select: {
                    id: true,
                    title: true,
                    controlType: true,
                    controlRisk: true
                }
            }),
            prisma.vendor.findMany({
                select: {
                    id: true,
                    name: true,
                    riskScore: true,
                    criticality: true
                }
            }),
            prisma.incident.findMany({
                select: {
                    id: true,
                    severity: true,
                    status: true
                }
            }),
            prisma.change.findMany({
                select: {
                    id: true,
                    status: true,
                    priority: true
                }
            }),
            prisma.evidence.findMany({
                select: {
                    id: true,
                    status: true
                }
            })
        ]);

        // Categorize risks by Zero Trust pillar
        const categorizeRisk = (risk: any): string[] => {
            const categories: string[] = [];
            const text = `${risk.narrative || ''} ${risk.assetId || ''} ${risk.category || ''}`.toLowerCase();

            if (text.includes('mfa') || text.includes('identity') || text.includes('auth') || text.includes('password') || text.includes('user') || text.includes('access control')) {
                categories.push('identity');
            }
            if (text.includes('device') || text.includes('endpoint') || text.includes('mobile') || text.includes('laptop') || text.includes('workstation')) {
                categories.push('device');
            }
            if (text.includes('network') || text.includes('firewall') || text.includes('segment') || text.includes('vpn') || text.includes('traffic')) {
                categories.push('network');
            }
            if (text.includes('application') || text.includes('api') || text.includes('container') || text.includes('microservice') || text.includes('code')) {
                categories.push('application');
            }
            if (text.includes('data') || text.includes('encryption') || text.includes('database') || text.includes('backup') || text.includes('dlp') || text.includes('privacy')) {
                categories.push('data');
            }

            if (categories.length === 0) {
                categories.push(risk.score > 75 ? 'identity' : risk.score > 50 ? 'network' : 'data');
            }

            return categories;
        };

        const identityRisks = risks.filter(r => categorizeRisk(r).includes('identity'));
        const deviceRisks = risks.filter(r => categorizeRisk(r).includes('device'));
        const networkRisks = risks.filter(r => categorizeRisk(r).includes('network'));
        const appRisks = risks.filter(r => categorizeRisk(r).includes('application'));
        const dataRisks = risks.filter(r => categorizeRisk(r).includes('data'));

        const getStatus = (issues: number, score: number): 'healthy' | 'warning' | 'critical' => {
            if (issues > 5 || score < 30) return 'critical';
            if (issues > 2 || score < 60) return 'warning';
            return 'healthy';
        };

        const calculateScore = (riskList: any[], mitigations: number): number => {
            if (riskList.length === 0) return 100;
            const avgRiskScore = riskList.reduce((sum, r) => sum + (r.score || 50), 0) / riskList.length;
            const mitigationBonus = Math.min(mitigations * 5, 30);
            return Math.max(0, Math.min(100, Math.round(100 - avgRiskScore + mitigationBonus)));
        };

        const identityControls = controls.filter(c =>
            c.title?.toLowerCase().includes('access') || c.title?.toLowerCase().includes('identity') || c.controlType === 'preventive'
        );
        const networkControls = controls.filter(c =>
            c.title?.toLowerCase().includes('network') || c.title?.toLowerCase().includes('segment')
        );

        const metrics = {
            identity: {
                score: calculateScore(identityRisks, identityControls.length),
                issues: identityRisks.filter(r => r.status === 'open').length,
                controls: identityControls.length,
                status: getStatus(identityRisks.filter(r => r.status === 'open').length, calculateScore(identityRisks, identityControls.length)),
                recentRisks: identityRisks.slice(0, 5).map(r => ({
                    id: r.id,
                    text: r.narrative?.substring(0, 80) || r.assetId || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt
                }))
            },
            device: {
                score: calculateScore(deviceRisks, vendors.length),
                issues: deviceRisks.filter(r => r.status === 'open').length + vendors.filter(v => (v.riskScore || 0) > 70).length,
                vendors: vendors.length,
                highRiskVendors: vendors.filter(v => (v.riskScore || 0) > 70).length,
                status: getStatus(deviceRisks.filter(r => r.status === 'open').length, calculateScore(deviceRisks, vendors.length)),
                recentRisks: deviceRisks.slice(0, 5).map(r => ({
                    id: r.id,
                    text: r.narrative?.substring(0, 80) || r.assetId || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt
                }))
            },
            network: {
                score: calculateScore(networkRisks, networkControls.length),
                issues: networkRisks.filter(r => r.status === 'open').length,
                controls: networkControls.length,
                status: getStatus(networkRisks.filter(r => r.status === 'open').length, calculateScore(networkRisks, networkControls.length)),
                recentRisks: networkRisks.slice(0, 5).map(r => ({
                    id: r.id,
                    text: r.narrative?.substring(0, 80) || r.assetId || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt
                }))
            },
            application: {
                score: Math.max(0, Math.min(100, 100 - (appRisks.length * 10) + (changes.filter(c => c.status === 'completed').length * 5))),
                issues: appRisks.filter(r => r.status === 'open').length + incidents.filter(i => i.severity === 'critical').length,
                changes: changes.length,
                criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
                status: getStatus(appRisks.filter(r => r.status === 'open').length, 100 - appRisks.length * 10),
                recentRisks: appRisks.slice(0, 5).map(r => ({
                    id: r.id,
                    text: r.narrative?.substring(0, 80) || r.assetId || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt
                }))
            },
            data: {
                score: calculateScore(dataRisks, evidence.length),
                issues: dataRisks.filter(r => r.status === 'open').length,
                evidence: evidence.length,
                approvedEvidence: evidence.filter(e => e.status === 'approved').length,
                status: getStatus(dataRisks.filter(r => r.status === 'open').length, calculateScore(dataRisks, evidence.length)),
                recentRisks: dataRisks.slice(0, 5).map(r => ({
                    id: r.id,
                    text: r.narrative?.substring(0, 80) || r.assetId || 'Unknown',
                    score: r.score,
                    createdAt: r.createdAt
                }))
            }
        };

        const overallScore = Math.round(
            (metrics.identity.score + metrics.device.score + metrics.network.score +
                metrics.application.score + metrics.data.score) / 5
        );

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            overallScore,
            totalRisks: risks.length,
            openRisks: risks.filter(r => r.status === 'open').length,
            pillars: metrics
        });
    } catch (error) {
        console.error('Zero Trust metrics error:', error);
        return NextResponse.json({ error: 'Failed to calculate metrics' }, { status: 500 });
    }
}
