/**
 * Git Sync Service
 * Synchronize GRC configurations with Git repositories
 */

import { GitSyncConfig, GitSyncResult, ConfigChange } from './types';
import { exportConfig, importConfig } from './config-as-code';

// In-memory storage for sync configurations (in production, use database)
let syncConfigs: GitSyncConfig[] = [];

// =============================================================================
// Configuration Management
// =============================================================================

export function getSyncConfigs(): GitSyncConfig[] {
    return syncConfigs;
}

export function getSyncConfig(id: string): GitSyncConfig | undefined {
    return syncConfigs.find(c => c.id === id);
}

export function createSyncConfig(config: Omit<GitSyncConfig, 'id' | 'status' | 'lastSync'>): GitSyncConfig {
    const newConfig: GitSyncConfig = {
        ...config,
        id: `git-${Date.now()}`,
        status: 'never',
    };
    syncConfigs.push(newConfig);
    return newConfig;
}

export function updateSyncConfig(id: string, updates: Partial<GitSyncConfig>): GitSyncConfig | null {
    const index = syncConfigs.findIndex(c => c.id === id);
    if (index === -1) return null;
    syncConfigs[index] = { ...syncConfigs[index], ...updates };
    return syncConfigs[index];
}

export function deleteSyncConfig(id: string): boolean {
    const index = syncConfigs.findIndex(c => c.id === id);
    if (index === -1) return false;
    syncConfigs.splice(index, 1);
    return true;
}

// =============================================================================
// Git Operations
// =============================================================================

interface GitFile {
    path: string;
    content: string;
    sha: string;
}

async function fetchFromGit(config: GitSyncConfig): Promise<{ files: GitFile[]; commit: string; error?: string }> {
    // Infrastructure requirement: Actual Git hooks or local Git CLI
    return {
        files: [],
        commit: '',
        error: 'Git Infrastructure Error: Sync requested but remote repository is not configured for automated access.'
    };
}

async function pushToGit(config: GitSyncConfig, content: string, message: string): Promise<{ success: boolean; commit?: string; error?: string }> {
    return {
        success: false,
        error: 'Git Infrastructure Error: Push failed. Write access to repository is not established.'
    };
}

// =============================================================================
// Sync Operations
// =============================================================================

export async function syncFromGit(configId: string): Promise<GitSyncResult> {
    const config = getSyncConfig(configId);
    if (!config) {
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: ['Sync configuration not found'],
        };
    }

    if (!config.enabled) {
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: ['Sync configuration is disabled'],
        };
    }

    try {
        const gitResult = await fetchFromGit(config);
        if (gitResult.error) {
            updateSyncConfig(configId, { status: 'error' });
            return {
                success: false,
                syncedAt: new Date().toISOString(),
                changes: [],
                errors: [gitResult.error],
            };
        }

        const allChanges: ConfigChange[] = [];
        const allErrors: string[] = [];

        for (const file of gitResult.files) {
            const format = file.path.endsWith('.yaml') || file.path.endsWith('.yml') ? 'yaml' : 'json';
            const importResult = await importConfig({
                format,
                content: file.content,
                dryRun: false,
                overwriteExisting: true,
            });
            allChanges.push(...importResult.changes);
            allErrors.push(...importResult.errors.map(e => `${file.path}: ${e.message}`));
        }

        updateSyncConfig(configId, {
            status: allErrors.length === 0 ? 'synced' : 'error',
            lastSync: new Date().toISOString(),
            lastCommit: gitResult.commit,
        });

        return {
            success: allErrors.length === 0,
            syncedAt: new Date().toISOString(),
            commit: gitResult.commit,
            changes: allChanges,
            errors: allErrors,
        };
    } catch (error: any) {
        updateSyncConfig(configId, { status: 'error' });
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: [error.message],
        };
    }
}

export async function syncToGit(configId: string): Promise<GitSyncResult> {
    const config = getSyncConfig(configId);
    if (!config) {
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: ['Sync configuration not found'],
        };
    }

    if (!config.enabled) {
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: ['Sync configuration is disabled'],
        };
    }

    try {
        const exportResult = await exportConfig({
            format: 'yaml',
            resources: ['controls', 'policies', 'frameworks', 'risks', 'vendors'],
            includeMetadata: false,
        });

        const pushResult = await pushToGit(
            config,
            exportResult.content,
            `GRC Sync: Updated configuration at ${new Date().toISOString()}`
        );

        if (!pushResult.success) {
            updateSyncConfig(configId, { status: 'error' });
            return {
                success: false,
                syncedAt: new Date().toISOString(),
                changes: [],
                errors: [pushResult.error || 'Failed to push to Git'],
            };
        }

        updateSyncConfig(configId, {
            status: 'synced',
            lastSync: new Date().toISOString(),
            lastCommit: pushResult.commit,
        });

        return {
            success: true,
            syncedAt: new Date().toISOString(),
            commit: pushResult.commit,
            changes: [],
            errors: [],
        };
    } catch (error: any) {
        updateSyncConfig(configId, { status: 'error' });
        return {
            success: false,
            syncedAt: new Date().toISOString(),
            changes: [],
            errors: [error.message],
        };
    }
}

// =============================================================================
// Initialization
// =============================================================================


// Demo initialization removed. Configurations must be created via API/DB.

