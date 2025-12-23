/**
 * API Route: Config as Code
 * Export/Import GRC resources as YAML/JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportConfig, importConfig, validateConfig, getConfigDiff } from '@/lib/integrations/config-as-code';
import type { ConfigFormat } from '@/lib/integrations/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'yaml') as ConfigFormat;
    const resourcesParam = searchParams.get('resources') || 'controls,policies,frameworks';
    const includeMetadata = searchParams.get('metadata') === 'true';

    const resources = resourcesParam.split(',').filter(r =>
        ['controls', 'policies', 'frameworks', 'risks', 'vendors'].includes(r)
    ) as ('controls' | 'policies' | 'frameworks' | 'risks' | 'vendors')[];

    try {
        const result = await exportConfig({
            format,
            resources,
            includeMetadata,
        });

        // If downloading, return as file
        if (searchParams.get('download') === 'true') {
            const filename = `grc-config-${new Date().toISOString().split('T')[0]}.${format}`;
            return new NextResponse(result.content, {
                headers: {
                    'Content-Type': format === 'yaml' ? 'text/yaml' : 'application/json',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[Config Export Error]:', error);
        return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, format, content, dryRun, overwriteExisting } = body;

        switch (action) {
            case 'validate': {
                if (!content || !format) {
                    return NextResponse.json({ error: 'Content and format required' }, { status: 400 });
                }
                const errors = validateConfig(content, format);
                return NextResponse.json({ valid: errors.length === 0, errors });
            }

            case 'diff': {
                if (!content || !format) {
                    return NextResponse.json({ error: 'Content and format required' }, { status: 400 });
                }
                const changes = await getConfigDiff({ format, content, dryRun: true });
                return NextResponse.json({ changes });
            }

            case 'import': {
                if (!content || !format) {
                    return NextResponse.json({ error: 'Content and format required' }, { status: 400 });
                }
                const result = await importConfig({
                    format,
                    content,
                    dryRun: dryRun || false,
                    overwriteExisting: overwriteExisting || false,
                });
                return NextResponse.json(result);
            }

            default:
                return NextResponse.json({ error: 'Unknown action. Use: validate, diff, or import' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[Config Import Error]:', error);
        return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
    }
}
