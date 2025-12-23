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

// =============================================================================
// Demo Data Generator
// =============================================================================

export function generateDemoMetrics(): DevSecOpsMetrics {
    return {
        pipelineHealth: {
            total: 12,
            passing: 10,
            failing: 2,
            successRate: 83.3
        },
        securityPosture: {
            totalVulnerabilities: 47,
            critical: 2,
            high: 8,
            medium: 22,
            low: 15,
            trend: 'improving'
        },
        configSync: {
            lastSync: new Date(Date.now() - 3600000).toISOString(),
            status: 'synced',
            pendingChanges: 0
        },
        connectors: {
            total: 4,
            connected: 3,
            errors: 1
        }
    };
}

export function generateDemoPipelines(): Pipeline[] {
    return [
        { id: '1', name: 'main-build', status: 'success', lastRun: new Date(Date.now() - 1800000).toISOString(), duration: 245, branch: 'main' },
        { id: '2', name: 'security-scan', status: 'success', lastRun: new Date(Date.now() - 3600000).toISOString(), duration: 180, branch: 'main' },
        { id: '3', name: 'deploy-staging', status: 'running', lastRun: new Date().toISOString(), branch: 'develop' },
        { id: '4', name: 'integration-tests', status: 'failed', lastRun: new Date(Date.now() - 7200000).toISOString(), duration: 890, branch: 'feature/auth' },
        { id: '5', name: 'container-scan', status: 'success', lastRun: new Date(Date.now() - 5400000).toISOString(), duration: 120, branch: 'main' },
        { id: '6', name: 'deploy-prod', status: 'pending', branch: 'main' },
    ];
}

export function generateDemoVulnerabilities(): Vulnerability[] {
    return [
        { id: '1', title: 'CVE-2024-1234: SQL Injection in auth module', severity: 'critical', package: 'pg', version: '8.7.1', fixedVersion: '8.11.0', source: 'Dependabot' },
        { id: '2', title: 'CVE-2024-5678: XSS vulnerability', severity: 'high', package: 'sanitize-html', version: '2.3.0', fixedVersion: '2.12.0', source: 'Snyk' },
        { id: '3', title: 'CVE-2024-9012: Path traversal', severity: 'high', package: 'express', version: '4.17.1', fixedVersion: '4.18.2', source: 'Trivy' },
        { id: '4', title: 'Outdated dependency with known issues', severity: 'medium', package: 'lodash', version: '4.17.15', fixedVersion: '4.17.21', source: 'npm audit' },
        { id: '5', title: 'Insecure default configuration', severity: 'medium', package: 'helmet', version: '4.0.0', source: 'CodeQL' },
        { id: '6', title: 'Minor information disclosure', severity: 'low', package: 'debug', version: '4.1.0', source: 'OWASP' },
    ];
}

export function generateDemoConnectors(): ConnectorConfig[] {
    return [
        { id: '1', type: 'github-actions', name: 'GitHub Actions - Main Repo', enabled: true, status: 'connected', config: { token: '***', owner: 'myorg' }, lastSync: new Date(Date.now() - 900000).toISOString() },
        { id: '2', type: 'jenkins', name: 'Jenkins CI Server', enabled: true, status: 'connected', config: { baseUrl: 'https://jenkins.example.com', username: 'admin', apiToken: '***' }, lastSync: new Date(Date.now() - 1800000).toISOString() },
        { id: '3', type: 'azure-devops', name: 'Azure DevOps', enabled: true, status: 'error', errorMessage: 'Authentication failed', config: { organization: 'myorg', pat: '***' } },
        { id: '4', type: 'gitlab', name: 'GitLab CI', enabled: false, status: 'disconnected', config: { baseUrl: 'https://gitlab.com', token: '***' } },
    ];
}
