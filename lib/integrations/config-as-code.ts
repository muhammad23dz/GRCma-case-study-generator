/**
 * Config as Code Service
 * Export/Import GRC resources as YAML/JSON configuration files
 * HARDENED: Supports both organization and personal ownership scopes
 */

import { prisma } from '@/lib/prisma';
import { getIsolationContext, IsolationContext } from '@/lib/isolation';
import {
    ConfigFormat,
    ConfigExportRequest,
    ConfigExportResult,
    ConfigImportRequest,
    ConfigImportResult,
    ConfigChange,
    ConfigError,
} from './types';
import * as yaml from 'yaml';

// =============================================================================
// Helper: Get scope filter based on context
// =============================================================================

function getScopeFilter(context: IsolationContext): { organizationId?: string; owner?: string } {
    // If user has an organization, scope by org
    if (context.orgId) {
        return { organizationId: context.orgId };
    }
    // Fallback: scope by owner email for personal accounts
    return { owner: context.email };
}

// =============================================================================
// Export Functions
// =============================================================================

export async function exportConfig(request: ConfigExportRequest): Promise<ConfigExportResult> {
    const context = await getIsolationContext();
    if (!context) {
        throw new Error("Unauthorized: Authentication required for export.");
    }

    const scopeFilter = getScopeFilter(context);
    const config: Record<string, any> = {};
    const resourceCounts: Record<string, number> = {};

    console.log('[Config Export] Scope:', context.orgId ? `Org: ${context.orgId}` : `Personal: ${context.email}`);

    // Fetch requested resources
    for (const resource of request.resources) {
        switch (resource) {
            case 'controls':
                const controls = await prisma.control.findMany({
                    where: scopeFilter,
                    include: { mappings: { include: { framework: true } } },
                });
                config.controls = controls.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    controlType: c.controlType,
                    owner: c.owner,
                    controlRisk: c.controlRisk,
                    ...(request.includeMetadata && {
                        createdAt: c.createdAt,
                        updatedAt: c.updatedAt,
                    }),
                }));
                resourceCounts.controls = controls.length;
                break;

            case 'policies':
                const policies = await prisma.policy.findMany({
                    where: scopeFilter
                });
                config.policies = policies.map(p => ({
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    status: p.status,
                    version: p.version,
                    owner: p.owner,
                    ...(request.includeMetadata && {
                        createdAt: p.createdAt,
                        updatedAt: p.updatedAt,
                    }),
                }));
                resourceCounts.policies = policies.length;
                break;

            case 'frameworks':
                // Frameworks are global in current schema
                const frameworks = await prisma.framework.findMany();
                config.frameworks = frameworks.map(f => ({
                    id: f.id,
                    name: f.name,
                    version: f.version,
                    description: f.description,
                }));
                resourceCounts.frameworks = frameworks.length;
                break;

            case 'risks':
                const risks = await prisma.risk.findMany({
                    where: scopeFilter
                });
                config.risks = risks.map(r => ({
                    id: r.id,
                    narrative: r.narrative,
                    category: r.category,
                    likelihood: r.likelihood,
                    impact: r.impact,
                    score: r.score,
                    status: r.status,
                    owner: r.owner,
                    ...(request.includeMetadata && {
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    }),
                }));
                resourceCounts.risks = risks.length;
                break;

            case 'vendors':
                const vendors = await prisma.vendor.findMany({
                    where: scopeFilter
                });
                config.vendors = vendors.map(v => ({
                    id: v.id,
                    name: v.name,
                    category: v.category,
                    criticality: v.criticality,
                    status: v.status,
                    owner: v.owner,
                    riskScore: v.riskScore,
                    ...(request.includeMetadata && {
                        createdAt: v.createdAt,
                        updatedAt: v.updatedAt,
                    }),
                }));
                resourceCounts.vendors = vendors.length;
                break;
        }
    }

    // Format output
    let content: string;
    if (request.format === 'yaml') {
        content = yaml.stringify(config, { lineWidth: 0 });
    } else {
        content = JSON.stringify(config, null, 2);
    }

    return {
        format: request.format,
        content,
        resourceCounts,
        exportedAt: new Date().toISOString(),
    };
}

// =============================================================================
// Import Functions
// =============================================================================

export async function importConfig(request: ConfigImportRequest): Promise<ConfigImportResult> {
    const context = await getIsolationContext();
    if (!context) {
        throw new Error("Unauthorized: Authentication required for import.");
    }

    // For import, we require an organization for now (to maintain data integrity)
    if (!context.orgId) {
        throw new Error("Organization required: Please join or create an organization to import configurations.");
    }

    const orgId = context.orgId;
    console.log('[Config Import] Importing to organization:', orgId);

    const changes: ConfigChange[] = [];
    const errors: ConfigError[] = [];
    const summary = { created: 0, updated: 0, deleted: 0, unchanged: 0 };

    // Parse config
    let config: Record<string, any>;
    try {
        if (request.format === 'yaml') {
            config = yaml.parse(request.content);
        } else {
            config = JSON.parse(request.content);
        }
    } catch (e: any) {
        return {
            success: false,
            dryRun: request.dryRun || false,
            changes: [],
            errors: [{ path: 'root', message: `Failed to parse ${request.format}: ${e.message}` }],
            summary,
        };
    }

    // Validate and process each resource type
    // Pass context for flexible org/personal ownership
    if (config.controls) {
        await processControls(config.controls, orgId, changes, errors, summary, request.dryRun, request.overwriteExisting);
    }

    if (config.policies) {
        await processPolicies(config.policies, orgId, changes, errors, summary, request.dryRun, request.overwriteExisting);
    }

    if (config.frameworks) {
        await processFrameworks(config.frameworks, orgId, changes, errors, summary, request.dryRun, request.overwriteExisting);
    }

    if (config.risks) {
        await processRisks(config.risks, orgId, changes, errors, summary, request.dryRun, request.overwriteExisting);
    }

    if (config.vendors) {
        await processVendors(config.vendors, orgId, changes, errors, summary, request.dryRun, request.overwriteExisting);
    }

    return {
        success: errors.length === 0,
        dryRun: request.dryRun || false,
        changes,
        errors,
        summary,
    };
}

// =============================================================================
// Resource Processors
// =============================================================================

async function processControls(
    controls: any[],
    orgId: string,
    changes: ConfigChange[],
    errors: ConfigError[],
    summary: { created: number; updated: number; unchanged: number; deleted: number },
    dryRun?: boolean,
    overwrite?: boolean
) {
    for (const control of controls) {
        if (!control.title) {
            errors.push({ path: `controls.${control.id || 'unknown'}`, message: 'Control title is required' });
            continue;
        }

        const existing = control.id ? await prisma.control.findFirst({
            where: { id: control.id, organizationId: orgId }
        }) : null;

        if (existing) {
            if (overwrite) {
                changes.push({
                    resourceType: 'control',
                    resourceId: control.id,
                    resourceName: control.title,
                    action: 'update',
                });
                if (!dryRun) {
                    await prisma.control.update({
                        where: { id: control.id },
                        data: {
                            title: control.title,
                            description: control.description || '',
                            controlType: control.controlType || 'preventive',
                            owner: control.owner,
                            controlRisk: control.controlRisk,
                        },
                    });
                }
                summary.updated++;
            } else {
                summary.unchanged++;
            }
        } else {
            changes.push({
                resourceType: 'control',
                resourceName: control.title,
                action: 'create',
            });
            if (!dryRun) {
                await prisma.control.create({
                    data: {
                        title: control.title,
                        description: control.description || '',
                        controlType: control.controlType || 'preventive',
                        owner: control.owner,
                        controlRisk: control.controlRisk,
                        organizationId: orgId
                    },
                });
            }
            summary.created++;
        }
    }
}

async function processPolicies(
    policies: any[],
    orgId: string,
    changes: ConfigChange[],
    errors: ConfigError[],
    summary: { created: number; updated: number; unchanged: number; deleted: number },
    dryRun?: boolean,
    overwrite?: boolean
) {
    for (const policy of policies) {
        if (!policy.title && !policy.name) {
            errors.push({ path: `policies.${policy.id || 'unknown'}`, message: 'Policy title is required' });
            continue;
        }

        const title = policy.title || policy.name;
        const existing = policy.id ? await prisma.policy.findFirst({
            where: { id: policy.id, organizationId: orgId }
        }) : null;

        if (existing) {
            if (overwrite) {
                changes.push({
                    resourceType: 'policy',
                    resourceId: policy.id,
                    resourceName: title,
                    action: 'update',
                });
                if (!dryRun) {
                    await prisma.policy.update({
                        where: { id: policy.id },
                        data: {
                            title: title,
                            status: policy.status,
                            version: policy.version,
                            owner: policy.owner,
                            content: policy.content || '',
                        },
                    });
                }
                summary.updated++;
            } else {
                summary.unchanged++;
            }
        } else {
            changes.push({
                resourceType: 'policy',
                resourceName: title,
                action: 'create',
            });
            if (!dryRun) {
                await prisma.policy.create({
                    data: {
                        title: title,
                        status: policy.status || 'draft',
                        version: policy.version || '1.0',
                        content: policy.content || '',
                        owner: policy.owner,
                        organizationId: orgId
                    },
                });
            }
            summary.created++;
        }
    }
}

async function processFrameworks(
    frameworks: any[],
    _orgId: string,
    changes: ConfigChange[],
    errors: ConfigError[],
    summary: { created: number; updated: number; unchanged: number; deleted: number },
    dryRun?: boolean,
    overwrite?: boolean
) {
    for (const framework of frameworks) {
        if (!framework.name) {
            errors.push({ path: `frameworks.${framework.id || 'unknown'}`, message: 'Framework name is required' });
            continue;
        }

        const existing = framework.id ? await prisma.framework.findUnique({
            where: { id: framework.id }
        }) : null;

        if (existing) {
            if (overwrite) {
                changes.push({
                    resourceType: 'framework',
                    resourceId: framework.id,
                    resourceName: framework.name,
                    action: 'update',
                });
                if (!dryRun) {
                    await prisma.framework.update({
                        where: { id: framework.id },
                        data: {
                            name: framework.name,
                            version: framework.version,
                            description: framework.description,
                        },
                    });
                }
                summary.updated++;
            } else {
                summary.unchanged++;
            }
        } else {
            changes.push({
                resourceType: 'framework',
                resourceName: framework.name,
                action: 'create',
            });
            if (!dryRun) {
                await prisma.framework.create({
                    data: {
                        name: framework.name,
                        version: framework.version || '1.0',
                        description: framework.description || '',
                    },
                });
            }
            summary.created++;
        }
    }
}

async function processRisks(
    risks: any[],
    orgId: string,
    changes: ConfigChange[],
    errors: ConfigError[],
    summary: { created: number; updated: number; unchanged: number; deleted: number },
    dryRun?: boolean,
    overwrite?: boolean
) {
    for (const risk of risks) {
        if (!risk.narrative && !risk.name) {
            errors.push({ path: `risks.${risk.id || 'unknown'}`, message: 'Risk narrative is required' });
            continue;
        }

        const narrative = risk.narrative || risk.name;
        const existing = risk.id ? await prisma.risk.findFirst({
            where: { id: risk.id, organizationId: orgId }
        }) : null;

        if (existing) {
            if (overwrite) {
                changes.push({
                    resourceType: 'risk',
                    resourceId: risk.id,
                    resourceName: narrative,
                    action: 'update',
                });
                if (!dryRun) {
                    await prisma.risk.update({
                        where: { id: risk.id },
                        data: {
                            narrative: narrative,
                            category: risk.category,
                            likelihood: risk.likelihood,
                            impact: risk.impact,
                            score: risk.score,
                            status: risk.status,
                            owner: risk.owner,
                        },
                    });
                }
                summary.updated++;
            } else {
                summary.unchanged++;
            }
        } else {
            changes.push({
                resourceType: 'risk',
                resourceName: narrative,
                action: 'create',
            });
            if (!dryRun) {
                await prisma.risk.create({
                    data: {
                        narrative: narrative,
                        category: risk.category || 'Operational',
                        likelihood: risk.likelihood || 3,
                        impact: risk.impact || 3,
                        score: risk.score || (risk.likelihood * risk.impact) || 9,
                        status: risk.status || 'identified',
                        owner: risk.owner,
                        organizationId: orgId
                    },
                });
            }
            summary.created++;
        }
    }
}

async function processVendors(
    vendors: any[],
    orgId: string,
    changes: ConfigChange[],
    errors: ConfigError[],
    summary: { created: number; updated: number; unchanged: number; deleted: number },
    dryRun?: boolean,
    overwrite?: boolean
) {
    for (const vendor of vendors) {
        if (!vendor.name) {
            errors.push({ path: `vendors.${vendor.id || 'unknown'}`, message: 'Vendor name is required' });
            continue;
        }

        const existing = vendor.id ? await prisma.vendor.findFirst({
            where: { id: vendor.id, organizationId: orgId }
        }) : null;

        if (existing) {
            if (overwrite) {
                changes.push({
                    resourceType: 'vendor',
                    resourceId: vendor.id,
                    resourceName: vendor.name,
                    action: 'update',
                });
                if (!dryRun) {
                    await prisma.vendor.update({
                        where: { id: vendor.id },
                        data: {
                            name: vendor.name,
                            category: vendor.category,
                            criticality: vendor.criticality || vendor.riskLevel,
                            status: vendor.status,
                            owner: vendor.owner,
                            riskScore: vendor.riskScore,
                        },
                    });
                }
                summary.updated++;
            } else {
                summary.unchanged++;
            }
        } else {
            changes.push({
                resourceType: 'vendor',
                resourceName: vendor.name,
                action: 'create',
            });
            if (!dryRun) {
                await prisma.vendor.create({
                    data: {
                        name: vendor.name,
                        category: vendor.category || 'Technology',
                        criticality: vendor.criticality || vendor.riskLevel || 'medium',
                        status: vendor.status || 'active',
                        owner: vendor.owner,
                        riskScore: vendor.riskScore || 50,
                        organizationId: orgId
                    },
                });
            }
            summary.created++;
        }
    }
}

// =============================================================================
// Validation
// =============================================================================

export function validateConfig(content: string, format: ConfigFormat): ConfigError[] {
    const errors: ConfigError[] = [];

    try {
        const config = format === 'yaml' ? yaml.parse(content) : JSON.parse(content);

        // Validate structure
        const validResourceTypes = ['controls', 'policies', 'frameworks', 'risks', 'vendors'];
        for (const key of Object.keys(config)) {
            if (!validResourceTypes.includes(key)) {
                errors.push({ path: key, message: `Unknown resource type: ${key}` });
            }
        }

        // Validate each resource
        for (const [type, items] of Object.entries(config)) {
            if (!Array.isArray(items)) {
                errors.push({ path: type, message: `${type} must be an array` });
                continue;
            }

            items.forEach((item: any, index: number) => {
                if (!item.name && !item.title && !item.narrative) {
                    errors.push({ path: `${type}[${index}]`, message: 'identification (name/title/narrative) is required' });
                }
            });
        }
    } catch (e: any) {
        errors.push({ path: 'root', message: `Parse error: ${e.message}` });
    }

    return errors;
}

// =============================================================================
// Diff Preview
// =============================================================================

export async function getConfigDiff(request: ConfigImportRequest): Promise<ConfigChange[]> {
    const result = await importConfig({ ...request, dryRun: true });
    return result.changes;
}
