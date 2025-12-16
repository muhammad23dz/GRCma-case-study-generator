import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ConnectorRegistry } from '@/lib/connectors/registry';

// POST /api/integrations/sync?id=<integrationId>
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const integrationId = searchParams.get('id');

        if (!integrationId) {
            return NextResponse.json({ error: 'Integration ID required' }, { status: 400 });
        }

        // Fetch Integration
        const integration = await prisma.integration.findUnique({
            where: { id: integrationId },
            include: { organization: true } // verify ownership if needed
        });

        if (!integration) {
            return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }

        // Get Connector
        const connector = ConnectorRegistry.getConnector(integration.provider);
        if (!connector) {
            return NextResponse.json({ error: `Provider ${integration.provider} not supported` }, { status: 400 });
        }

        // Execute Collection
        const evidenceItems = await connector.collectEvidence({
            encryptedCredentials: integration.encryptedCredentials,
            config: integration.config
        });

        // Save Evidence
        const savedEvidence = [];
        for (const item of evidenceItems) {
            // Create evidence record
            const evidence = await prisma.evidence.create({
                data: {
                    evidenceType: item.evidenceType || 'automated',
                    source: item.source || 'connector',
                    description: item.description,
                    summary: item.summary,
                    fileUrl: item.fileUrl,
                    fileName: item.fileName,
                    verificationStatus: 'pending',
                    status: 'under_review',
                    extractedData: item.extractedData as any, // JSON
                    uploadedBy: 'system_connector',
                    organizationId: integration.organizationId,
                    integrationId: integration.id,
                    // Auto-link to controls if possible? For now, leave unlinked or link via specialized logic
                }
            });
            savedEvidence.push(evidence);
        }

        // Update Integration Sync Status
        await prisma.integration.update({
            where: { id: integration.id },
            data: {
                lastSyncAt: new Date(),
                status: 'active',
                errorMessage: null
            }
        });

        return NextResponse.json({
            success: true,
            count: savedEvidence.length,
            evidence: savedEvidence
        });

    } catch (error: any) {
        console.error("Sync Error:", error);

        // Update Integration Error
        const integrationId = req.nextUrl.searchParams.get('id');
        if (integrationId) {
            await prisma.integration.update({
                where: { id: integrationId },
                data: {
                    status: 'error',
                    errorMessage: error.message
                }
            });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
