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
// Git Operations (Simulated - would use actual Git library in production)
// =============================================================================

interface GitFile {
    path: string;
    content: string;
    sha: string;
}

async function fetchFromGit(config: GitSyncConfig): Promise<{ files: GitFile[]; commit: string; error?: string }> {
    // In production, this would:
    // 1. Clone/pull the repository
    // 2. Read files from the specified path
    // 3. Return the file contents and latest commit SHA

    // For now, return demo data
    console.log(`[Git Sync] Fetching from ${config.repository}/${config.branch}:${config.path}`);

    return {
        files: [
            {
                path: `${config.path}/controls.yaml`,
                content: `controls:
  - name: Access Control Policy
    category: Access Control
    status: implemented
  - name: Data Encryption
    category: Data Protection
    status: implemented
  - name: Incident Response Plan
    category: Incident Management
    status: draft`,
                sha: 'abc123',
            },
            {
                path: `${config.path}/policies.yaml`,
                content: `policies:
  - name: Information Security Policy
    category: Security
    status: approved
    version: "2.1"
  - name: Acceptable Use Policy
    category: Compliance
    status: approved
    version: "1.5"`,
                sha: 'def456',
            },
        ],
        commit: 'abc123def456789',
    };
}

async function pushToGit(config: GitSyncConfig, content: string, message: string): Promise<{ success: boolean; commit?: string; error?: string }> {
    // In production, this would:
    // 1. Write files to the local repo
    // 2. Commit changes
    // 3. Push to remote

    console.log(`[Git Sync] Pushing to ${config.repository}/${config.branch}`);
    console.log(`[Git Sync] Commit message: ${message}`);

    return {
        success: true,
        commit: `new-${Date.now().toString(16)}`,
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
        // Fetch from Git
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

        // Process each file
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

        // Update sync status
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
        // Export current state
        const exportResult = await exportConfig({
            format: 'yaml',
            resources: ['controls', 'policies', 'frameworks', 'risks', 'vendors'],
            includeMetadata: false,
        });

        // Push to Git
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

        // Update sync status
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
// Initialization with Demo Config
// =============================================================================

export function initializeDemoConfigs() {
    if (syncConfigs.length === 0) {
        syncConfigs = [
            {
                id: 'demo-1',
                repository: 'https://github.com/myorg/grc-policies',
                branch: 'main',
                path: 'grc/',
                enabled: true,
                autoSync: false,
                syncInterval: 60,
                lastSync: new Date(Date.now() - 3600000).toISOString(),
                lastCommit: 'abc123def456',
                status: 'synced',
                direction: 'bidirectional',
            },
            {
                id: 'demo-2',
                repository: 'https://github.com/myorg/security-controls',
                branch: 'develop',
                path: 'controls/',
                enabled: true,
                autoSync: true,
                syncInterval: 30,
                status: 'pending',
                direction: 'pull',
            },
        ];
    }
}

// Initialize demo configs on module load
initializeDemoConfigs();
