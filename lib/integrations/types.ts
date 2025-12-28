/**
 * DevSecOps Integration Types
 * TypeScript interfaces for CI/CD connectors, Config as Code, and Git Sync
 */

// =============================================================================
// Connector Types
// =============================================================================

export type ConnectorType = 'jenkins' | 'github-actions' | 'azure-devops' | 'gitlab' | 'bitbucket';

export interface ConnectorConfig {
    id: string;
    type: ConnectorType;
    name: string;
    enabled: boolean;
    config: JenkinsConfig | GitHubActionsConfig | AzureDevOpsConfig | GitLabConfig;
    lastSync?: string;
    status: 'connected' | 'disconnected' | 'error';
    errorMessage?: string;
}

export interface JenkinsConfig {
    baseUrl: string;
    username: string;
    apiToken: string;
}

export interface GitHubActionsConfig {
    token: string;
    owner: string;
    repo?: string; // Optional - if not set, fetches all repos
}

export interface AzureDevOpsConfig {
    organization: string;
    pat: string;
    project?: string;
}

export interface GitLabConfig {
    baseUrl: string;
    token: string;
    projectId?: string;
}

// =============================================================================
// Sync Results
// =============================================================================

export interface SyncResult {
    success: boolean;
    connectorId: string;
    connectorType: ConnectorType;
    syncedAt: string;
    data: PipelineData | SecurityData;
    errors: string[];
}

export interface PipelineData {
    pipelines: Pipeline[];
    totalRuns: number;
    successRate: number;
    failedRuns: number;
}

export interface Pipeline {
    id: string;
    name: string;
    status: 'success' | 'failed' | 'running' | 'pending' | 'cancelled';
    lastRun?: string;
    duration?: number;
    branch?: string;
    commit?: string;
    url?: string;
}

export interface SecurityData {
    vulnerabilities: Vulnerability[];
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
}

export interface Vulnerability {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    package?: string;
    version?: string;
    fixedVersion?: string;
    description?: string;
    url?: string;
    source: string;
}

// =============================================================================
// Config as Code Types
// =============================================================================

export type ConfigFormat = 'yaml' | 'json';

export interface ConfigExportRequest {
    format: ConfigFormat;
    resources: ('controls' | 'policies' | 'frameworks' | 'risks' | 'vendors')[];
    includeMetadata?: boolean;
}

export interface ConfigExportResult {
    format: ConfigFormat;
    content: string;
    resourceCounts: Record<string, number>;
    exportedAt: string;
}

export interface ConfigImportRequest {
    format: ConfigFormat;
    content: string;
    dryRun?: boolean;
    overwriteExisting?: boolean;
}

export interface ConfigImportResult {
    success: boolean;
    dryRun: boolean;
    changes: ConfigChange[];
    errors: ConfigError[];
    summary: {
        created: number;
        updated: number;
        deleted: number;
        unchanged: number;
    };
}

export interface ConfigChange {
    resourceType: string;
    resourceId?: string;
    resourceName: string;
    action: 'create' | 'update' | 'delete';
    changes?: Record<string, { old: any; new: any }>;
}

export interface ConfigError {
    path: string;
    message: string;
    line?: number;
}

// =============================================================================
// Git Sync Types
// =============================================================================

export interface GitSyncConfig {
    id: string;
    repository: string;
    branch: string;
    path: string;
    enabled: boolean;
    autoSync: boolean;
    syncInterval?: number; // minutes
    lastSync?: string;
    lastCommit?: string;
    status: 'synced' | 'pending' | 'error' | 'never';
    direction: 'pull' | 'push' | 'bidirectional';
}

export interface GitSyncResult {
    success: boolean;
    syncedAt: string;
    commit?: string;
    changes: ConfigChange[];
    errors: string[];
}

// =============================================================================
// Dashboard Metrics
// =============================================================================

export interface DevSecOpsMetrics {
    pipelineHealth: {
        total: number;
        passing: number;
        failing: number;
        successRate: number;
    };
    securityPosture: {
        totalVulnerabilities: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        trend: 'improving' | 'stable' | 'degrading';
    };
    configSync: {
        lastSync?: string;
        status: 'synced' | 'pending' | 'error' | 'never';
        pendingChanges: number;
    };
    connectors: {
        total: number;
        connected: number;
        errors: number;
    };
}

// No demo data generators in production

