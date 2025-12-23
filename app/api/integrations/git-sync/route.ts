/**
 * API Route: Git Sync
 * Synchronize GRC resources with Git repositories
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getSyncConfigs,
    getSyncConfig,
    createSyncConfig,
    updateSyncConfig,
    deleteSyncConfig,
    syncFromGit,
    syncToGit,
} from '@/lib/integrations/git-sync';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        const config = getSyncConfig(id);
        if (!config) {
            return NextResponse.json({ error: 'Sync configuration not found' }, { status: 404 });
        }
        return NextResponse.json(config);
    }

    return NextResponse.json({ configs: getSyncConfigs() });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, id, config } = body;

        switch (action) {
            case 'create': {
                if (!config?.repository || !config?.branch) {
                    return NextResponse.json({ error: 'Repository and branch required' }, { status: 400 });
                }
                const newConfig = createSyncConfig({
                    repository: config.repository,
                    branch: config.branch,
                    path: config.path || '/',
                    enabled: config.enabled ?? true,
                    autoSync: config.autoSync ?? false,
                    syncInterval: config.syncInterval,
                    direction: config.direction || 'pull',
                });
                return NextResponse.json(newConfig, { status: 201 });
            }

            case 'update': {
                if (!id) {
                    return NextResponse.json({ error: 'Sync config ID required' }, { status: 400 });
                }
                const updated = updateSyncConfig(id, config);
                if (!updated) {
                    return NextResponse.json({ error: 'Sync configuration not found' }, { status: 404 });
                }
                return NextResponse.json(updated);
            }

            case 'delete': {
                if (!id) {
                    return NextResponse.json({ error: 'Sync config ID required' }, { status: 400 });
                }
                const deleted = deleteSyncConfig(id);
                if (!deleted) {
                    return NextResponse.json({ error: 'Sync configuration not found' }, { status: 404 });
                }
                return NextResponse.json({ success: true });
            }

            case 'sync-pull': {
                if (!id) {
                    return NextResponse.json({ error: 'Sync config ID required' }, { status: 400 });
                }
                const pullResult = await syncFromGit(id);
                return NextResponse.json(pullResult);
            }

            case 'sync-push': {
                if (!id) {
                    return NextResponse.json({ error: 'Sync config ID required' }, { status: 400 });
                }
                const pushResult = await syncToGit(id);
                return NextResponse.json(pushResult);
            }

            default:
                return NextResponse.json({ error: 'Unknown action. Use: create, update, delete, sync-pull, or sync-push' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[Git Sync API Error]:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
