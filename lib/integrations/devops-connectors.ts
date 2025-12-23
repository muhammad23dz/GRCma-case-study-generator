/**
 * DevOps Connectors
 * CI/CD integrations for Jenkins, GitHub Actions, Azure DevOps, GitLab
 */

import {
    ConnectorType,
    ConnectorConfig,
    JenkinsConfig,
    GitHubActionsConfig,
    AzureDevOpsConfig,
    GitLabConfig,
    Pipeline,
    Vulnerability,
    SyncResult,
    generateDemoPipelines,
    generateDemoVulnerabilities,
} from './types';

// =============================================================================
// Base Connector
// =============================================================================

abstract class BaseConnector {
    protected name: string;
    protected baseURL: string = '';
    protected headers: Record<string, string> = {};

    constructor(name: string) {
        this.name = name;
    }

    protected setBaseURL(url: string) {
        this.baseURL = url.replace(/\/$/, '');
    }

    protected setHeaders(headers: Record<string, string>) {
        this.headers = { ...this.headers, ...headers };
    }

    protected async get<T>(path: string): Promise<{ data?: T; error?: string }> {
        try {
            const response = await fetch(`${this.baseURL}${path}`, {
                method: 'GET',
                headers: this.headers,
            });
            if (!response.ok) {
                return { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            const data = await response.json();
            return { data };
        } catch (error: any) {
            return { error: error.message || 'Request failed' };
        }
    }

    abstract testConnection(config: any): Promise<{ success: boolean; message: string }>;
    abstract sync(config: any): Promise<{ pipelines: Pipeline[]; vulnerabilities: Vulnerability[]; errors: string[] }>;
}

// =============================================================================
// Jenkins Connector
// =============================================================================

export class JenkinsConnector extends BaseConnector {
    constructor() {
        super('JenkinsConnector');
    }

    async testConnection(config: JenkinsConfig): Promise<{ success: boolean; message: string }> {
        if (!config.baseUrl || !config.username) {
            return { success: false, message: 'Base URL and credentials required' };
        }

        try {
            const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
            this.setHeaders({ Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' });
            this.setBaseURL(config.baseUrl);

            const result = await this.get<any>('/api/json');
            if (result.error) {
                return { success: false, message: result.error };
            }
            return { success: true, message: `Connected to Jenkins v${result.data?.hudsonVersion || 'Unknown'}` };
        } catch (error: any) {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }

    async sync(config: JenkinsConfig): Promise<{ pipelines: Pipeline[]; vulnerabilities: Vulnerability[]; errors: string[] }> {
        const pipelines: Pipeline[] = [];
        const errors: string[] = [];

        try {
            const auth = Buffer.from(`${config.username}:${config.apiToken}`).toString('base64');
            this.setHeaders({ Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' });
            this.setBaseURL(config.baseUrl);

            const result = await this.get<any>('/api/json?tree=jobs[name,color,lastBuild[result,timestamp,duration]]');
            if (result.data?.jobs) {
                for (const job of result.data.jobs) {
                    pipelines.push({
                        id: job.name,
                        name: job.name,
                        status: this.mapJenkinsStatus(job.color),
                        lastRun: job.lastBuild?.timestamp ? new Date(job.lastBuild.timestamp).toISOString() : undefined,
                        duration: job.lastBuild?.duration ? Math.round(job.lastBuild.duration / 1000) : undefined,
                    });
                }
            } else if (result.error) {
                errors.push(result.error);
            }
        } catch (error: any) {
            errors.push(error.message);
        }

        return { pipelines, vulnerabilities: [], errors };
    }

    private mapJenkinsStatus(color: string): Pipeline['status'] {
        if (color?.includes('blue')) return 'success';
        if (color?.includes('red')) return 'failed';
        if (color?.includes('anime')) return 'running';
        if (color?.includes('yellow')) return 'pending';
        return 'cancelled';
    }
}

// =============================================================================
// GitHub Actions Connector
// =============================================================================

export class GitHubActionsConnector extends BaseConnector {
    constructor() {
        super('GitHubActionsConnector');
    }

    async testConnection(config: GitHubActionsConfig): Promise<{ success: boolean; message: string }> {
        if (!config.token) {
            return { success: false, message: 'GitHub token required' };
        }

        try {
            this.setHeaders({
                Authorization: `Bearer ${config.token}`,
                Accept: 'application/vnd.github.v3+json',
            });
            this.setBaseURL('https://api.github.com');

            const result = await this.get<any>('/user');
            if (result.error) {
                return { success: false, message: result.error };
            }
            return { success: true, message: `Connected as ${result.data?.login || 'Unknown'}` };
        } catch (error: any) {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }

    async sync(config: GitHubActionsConfig): Promise<{ pipelines: Pipeline[]; vulnerabilities: Vulnerability[]; errors: string[] }> {
        const pipelines: Pipeline[] = [];
        const vulnerabilities: Vulnerability[] = [];
        const errors: string[] = [];

        try {
            this.setHeaders({
                Authorization: `Bearer ${config.token}`,
                Accept: 'application/vnd.github.v3+json',
            });
            this.setBaseURL('https://api.github.com');

            // Get workflow runs
            const repoPath = config.repo ? `repos/${config.owner}/${config.repo}` : `orgs/${config.owner}`;
            const runsResult = await this.get<any>(`/${repoPath}/actions/runs?per_page=20`);

            if (runsResult.data?.workflow_runs) {
                for (const run of runsResult.data.workflow_runs) {
                    pipelines.push({
                        id: run.id.toString(),
                        name: run.name || run.workflow_id.toString(),
                        status: this.mapGitHubStatus(run.conclusion || run.status),
                        lastRun: run.updated_at,
                        branch: run.head_branch,
                        commit: run.head_sha?.substring(0, 7),
                        url: run.html_url,
                    });
                }
            } else if (runsResult.error) {
                errors.push(runsResult.error);
            }

            // Get Dependabot alerts
            if (config.repo) {
                const alertsResult = await this.get<any>(`/repos/${config.owner}/${config.repo}/dependabot/alerts?state=open`);
                if (alertsResult.data && Array.isArray(alertsResult.data)) {
                    for (const alert of alertsResult.data) {
                        vulnerabilities.push({
                            id: alert.number.toString(),
                            title: alert.security_advisory?.summary || 'Unknown vulnerability',
                            severity: alert.security_advisory?.severity || 'medium',
                            package: alert.dependency?.package?.name,
                            version: alert.dependency?.manifest_path,
                            description: alert.security_advisory?.description,
                            url: alert.html_url,
                            source: 'Dependabot',
                        });
                    }
                }
            }
        } catch (error: any) {
            errors.push(error.message);
        }

        return { pipelines, vulnerabilities, errors };
    }

    private mapGitHubStatus(status: string): Pipeline['status'] {
        switch (status) {
            case 'success': return 'success';
            case 'failure': return 'failed';
            case 'in_progress': case 'queued': return 'running';
            case 'pending': case 'waiting': return 'pending';
            default: return 'cancelled';
        }
    }
}

// =============================================================================
// Azure DevOps Connector
// =============================================================================

export class AzureDevOpsConnector extends BaseConnector {
    constructor() {
        super('AzureDevOpsConnector');
    }

    async testConnection(config: AzureDevOpsConfig): Promise<{ success: boolean; message: string }> {
        if (!config.organization || !config.pat) {
            return { success: false, message: 'Organization and PAT required' };
        }

        try {
            const auth = Buffer.from(`:${config.pat}`).toString('base64');
            this.setHeaders({ Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' });
            this.setBaseURL(`https://dev.azure.com/${config.organization}`);

            const result = await this.get<any>('/_apis/projects?api-version=7.0');
            if (result.error) {
                return { success: false, message: result.error };
            }
            return { success: true, message: `Connected to ${config.organization}. Found ${result.data?.count || 0} projects.` };
        } catch (error: any) {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }

    async sync(config: AzureDevOpsConfig): Promise<{ pipelines: Pipeline[]; vulnerabilities: Vulnerability[]; errors: string[] }> {
        const pipelines: Pipeline[] = [];
        const errors: string[] = [];

        try {
            const auth = Buffer.from(`:${config.pat}`).toString('base64');
            this.setHeaders({ Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' });
            this.setBaseURL(`https://dev.azure.com/${config.organization}`);

            const projectPath = config.project ? `/${config.project}` : '';
            const runsResult = await this.get<any>(`${projectPath}/_apis/pipelines/runs?api-version=7.0`);

            if (runsResult.data?.value) {
                for (const run of runsResult.data.value) {
                    pipelines.push({
                        id: run.id.toString(),
                        name: run.pipeline?.name || run.name,
                        status: this.mapAzureStatus(run.state, run.result),
                        lastRun: run.finishedDate || run.createdDate,
                        url: run._links?.web?.href,
                    });
                }
            } else if (runsResult.error) {
                errors.push(runsResult.error);
            }
        } catch (error: any) {
            errors.push(error.message);
        }

        return { pipelines, vulnerabilities: [], errors };
    }

    private mapAzureStatus(state: string, result: string): Pipeline['status'] {
        if (state === 'inProgress') return 'running';
        if (result === 'succeeded') return 'success';
        if (result === 'failed') return 'failed';
        if (result === 'canceled') return 'cancelled';
        return 'pending';
    }
}

// =============================================================================
// GitLab Connector
// =============================================================================

export class GitLabConnector extends BaseConnector {
    constructor() {
        super('GitLabConnector');
    }

    async testConnection(config: GitLabConfig): Promise<{ success: boolean; message: string }> {
        if (!config.token) {
            return { success: false, message: 'GitLab token required' };
        }

        try {
            this.setHeaders({ 'PRIVATE-TOKEN': config.token, 'Content-Type': 'application/json' });
            this.setBaseURL(config.baseUrl || 'https://gitlab.com');

            const result = await this.get<any>('/api/v4/user');
            if (result.error) {
                return { success: false, message: result.error };
            }
            return { success: true, message: `Connected as ${result.data?.username || 'Unknown'}` };
        } catch (error: any) {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }

    async sync(config: GitLabConfig): Promise<{ pipelines: Pipeline[]; vulnerabilities: Vulnerability[]; errors: string[] }> {
        const pipelines: Pipeline[] = [];
        const vulnerabilities: Vulnerability[] = [];
        const errors: string[] = [];

        try {
            this.setHeaders({ 'PRIVATE-TOKEN': config.token, 'Content-Type': 'application/json' });
            this.setBaseURL(config.baseUrl || 'https://gitlab.com');

            const projectPath = config.projectId ? `/projects/${config.projectId}` : '/projects';
            const pipelinesResult = await this.get<any>(`/api/v4${projectPath}/pipelines?per_page=20`);

            if (pipelinesResult.data && Array.isArray(pipelinesResult.data)) {
                for (const pipeline of pipelinesResult.data) {
                    pipelines.push({
                        id: pipeline.id.toString(),
                        name: `Pipeline #${pipeline.id}`,
                        status: this.mapGitLabStatus(pipeline.status),
                        lastRun: pipeline.updated_at,
                        branch: pipeline.ref,
                        commit: pipeline.sha?.substring(0, 7),
                        url: pipeline.web_url,
                    });
                }
            } else if (pipelinesResult.error) {
                errors.push(pipelinesResult.error);
            }

            // Get vulnerability report if project specified
            if (config.projectId) {
                const vulnResult = await this.get<any>(`/api/v4/projects/${config.projectId}/vulnerability_findings`);
                if (vulnResult.data && Array.isArray(vulnResult.data)) {
                    for (const vuln of vulnResult.data) {
                        vulnerabilities.push({
                            id: vuln.id.toString(),
                            title: vuln.name || vuln.message,
                            severity: vuln.severity?.toLowerCase() || 'medium',
                            description: vuln.description,
                            source: 'GitLab SAST',
                        });
                    }
                }
            }
        } catch (error: any) {
            errors.push(error.message);
        }

        return { pipelines, vulnerabilities, errors };
    }

    private mapGitLabStatus(status: string): Pipeline['status'] {
        switch (status) {
            case 'success': return 'success';
            case 'failed': return 'failed';
            case 'running': case 'pending': return 'running';
            case 'created': case 'waiting_for_resource': return 'pending';
            default: return 'cancelled';
        }
    }
}

// =============================================================================
// Connector Factory
// =============================================================================

export function createConnector(type: ConnectorType): BaseConnector {
    switch (type) {
        case 'jenkins': return new JenkinsConnector();
        case 'github-actions': return new GitHubActionsConnector();
        case 'azure-devops': return new AzureDevOpsConnector();
        case 'gitlab': return new GitLabConnector();
        default: throw new Error(`Unknown connector type: ${type}`);
    }
}

export async function testConnector(connector: ConnectorConfig): Promise<{ success: boolean; message: string }> {
    try {
        const instance = createConnector(connector.type);
        return await instance.testConnection(connector.config);
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function syncConnector(connector: ConnectorConfig): Promise<SyncResult> {
    try {
        const instance = createConnector(connector.type);
        const result = await instance.sync(connector.config);

        return {
            success: result.errors.length === 0,
            connectorId: connector.id,
            connectorType: connector.type,
            syncedAt: new Date().toISOString(),
            data: {
                pipelines: result.pipelines,
                totalRuns: result.pipelines.length,
                successRate: result.pipelines.length > 0
                    ? (result.pipelines.filter(p => p.status === 'success').length / result.pipelines.length) * 100
                    : 0,
                failedRuns: result.pipelines.filter(p => p.status === 'failed').length,
            },
            errors: result.errors,
        };
    } catch (error: any) {
        return {
            success: false,
            connectorId: connector.id,
            connectorType: connector.type,
            syncedAt: new Date().toISOString(),
            data: { pipelines: [], totalRuns: 0, successRate: 0, failedRuns: 0 },
            errors: [error.message],
        };
    }
}

// Demo mode - returns simulated data when no real connectors configured
export function getDemoData(): { pipelines: Pipeline[]; vulnerabilities: Vulnerability[] } {
    return {
        pipelines: generateDemoPipelines(),
        vulnerabilities: generateDemoVulnerabilities(),
    };
}
