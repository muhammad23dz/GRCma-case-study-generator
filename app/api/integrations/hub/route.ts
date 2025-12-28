import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/integrations/hub - List Available Integrations
export async function GET() {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orgId = context.orgId;
        if (!orgId) {
            return NextResponse.json({ error: 'Organization context missing' }, { status: 400 });
        }

        // Get configured integrations for this organization
        const configured = await prisma.integration.findMany({
            where: { organizationId: orgId },
            orderBy: { updatedAt: 'desc' }
        });

        // Define available integration catalog
        const catalog = [
            // SIEM
            { provider: 'splunk', type: 'siem', name: 'Splunk', description: 'Security event monitoring', logo: '/integrations/splunk.png' },
            { provider: 'sentinel', type: 'siem', name: 'Microsoft Sentinel', description: 'Cloud-native SIEM', logo: '/integrations/sentinel.png' },
            { provider: 'qradar', type: 'siem', name: 'IBM QRadar', description: 'Enterprise SIEM', logo: '/integrations/qradar.png' },

            // Cloud
            { provider: 'aws', type: 'cloud', name: 'Amazon Web Services', description: 'AWS Security Hub, Config', logo: '/integrations/aws.png' },
            { provider: 'azure', type: 'cloud', name: 'Microsoft Azure', description: 'Azure Security Center', logo: '/integrations/azure.png' },
            { provider: 'gcp', type: 'cloud', name: 'Google Cloud', description: 'Security Command Center', logo: '/integrations/gcp.png' },

            // Identity
            { provider: 'okta', type: 'identity', name: 'Okta', description: 'Identity & Access Management', logo: '/integrations/okta.png' },
            { provider: 'azure_ad', type: 'identity', name: 'Azure AD', description: 'Microsoft Entra ID', logo: '/integrations/azure-ad.png' },
            { provider: 'onelogin', type: 'identity', name: 'OneLogin', description: 'IAM provider', logo: '/integrations/onelogin.png' },

            // Ticketing
            { provider: 'jira', type: 'ticketing', name: 'Jira', description: 'Issue tracking', logo: '/integrations/jira.png' },
            { provider: 'servicenow', type: 'ticketing', name: 'ServiceNow', description: 'IT Service Management', logo: '/integrations/servicenow.png' },
            { provider: 'zendesk', type: 'ticketing', name: 'Zendesk', description: 'Support ticketing', logo: '/integrations/zendesk.png' },

            // Communication
            { provider: 'slack', type: 'communication', name: 'Slack', description: 'Team communication', logo: '/integrations/slack.png' },
            { provider: 'teams', type: 'communication', name: 'Microsoft Teams', description: 'Team collaboration', logo: '/integrations/teams.png' },
            { provider: 'email', type: 'communication', name: 'Email (SMTP)', description: 'Email notifications', logo: '/integrations/email.png' },

            // Security
            { provider: 'crowdstrike', type: 'security', name: 'CrowdStrike', description: 'Endpoint protection', logo: '/integrations/crowdstrike.png' },
            { provider: 'carbon_black', type: 'security', name: 'Carbon Black', description: 'EDR solution', logo: '/integrations/carbonblack.png' },
            { provider: 'tenable', type: 'security', name: 'Tenable', description: 'Vulnerability management', logo: '/integrations/tenable.png' },

            // GRC
            { provider: 'github', type: 'grc', name: 'GitHub', description: 'Code & evidence sync', logo: '/integrations/github.png' },
            { provider: 'gitlab', type: 'grc', name: 'GitLab', description: 'DevSecOps integration', logo: '/integrations/gitlab.png' },
        ];

        const integrations = catalog.map(item => {
            const config = configured.find(c => c.provider === item.provider);
            return {
                ...item,
                configured: !!config,
                status: config?.status || 'not_configured',
                lastSynced: config?.lastSyncAt,
                integrationId: config?.id
            };
        });

        const byType = integrations.reduce((acc, i) => {
            if (!acc[i.type]) acc[i.type] = [];
            acc[i.type].push(i);
            return acc;
        }, {} as Record<string, typeof integrations>);

        return NextResponse.json({
            integrations,
            byType,
            summary: {
                total: catalog.length,
                configured: configured.length,
                active: configured.filter(c => c.status === 'active').length,
                errors: configured.filter(c => c.status === 'error').length
            }
        });
    } catch (error: any) {
        console.error('Error fetching integrations hub:', error);
        return NextResponse.json({ error: 'Infrastructure Error: Could not retrieve integrations hub.' }, { status: 500 });
    }
}

// POST /api/integrations/hub - Configure Integration
export async function POST(request: NextRequest) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
        }

        const orgId = context.orgId;
        if (!orgId) {
            return NextResponse.json({ error: 'Organization context missing' }, { status: 400 });
        }
        const userEmail = context.email;

        const body = await request.json();
        const { provider, type, name, config, apiKey } = body;

        if (!provider || !type) {
            return NextResponse.json({ error: 'Provider and type are required' }, { status: 400 });
        }

        const encryptedCredentials = apiKey
            ? Buffer.from(JSON.stringify({ apiKey, configuredBy: userEmail })).toString('base64')
            : '';

        const integration = await prisma.integration.create({
            data: {
                provider,
                name: name || provider,
                status: 'active',
                encryptedCredentials,
                config: config || undefined,
                organizationId: orgId
            }
        });

        return NextResponse.json({
            integration: {
                id: integration.id,
                provider: integration.provider,
                status: integration.status,
                message: 'Integration configured successfully'
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error configuring integration:', error);
        return NextResponse.json({ error: 'Failed to configure integration in database' }, { status: 500 });
    }
}

