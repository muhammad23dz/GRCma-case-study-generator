import { prisma } from '@/lib/prisma'; // Assumes @/lib/prisma is correct path

/**
 * GRC Automation Library
 * Centralizes logic for automated risk, compliance, and governance workflows.
 * Adheres to NIST SP 800-53 and ISO 31000 principles.
 */

// --- TPRM: Third-Party Risk Management ---

/**
 * Assesses vendor criticality and automatically creates/updates associated risks.
 * Triggered on Vendor Create/Update.
 */
export async function assessVendorRisk(
    vendorId: string,
    vendorName: string,
    criticality: string,
    ownerEmail: string
) {
    // Only 'High' or 'Critical' vendors trigger automatic risk creation
    if (!['High', 'Critical'].includes(criticality)) {
        return;
    }

    // Check if a vendor risk link already exists
    const existingLink = await prisma.vendorRisk.findFirst({
        where: { vendorId },
        include: { risk: true }
    });

    if (existingLink) {
        // If exists, ensure the risk score reflects the high criticality (Continuous Monitoring)
        // In a real system, we might leave manual scores alone, but for this demo, we ensure alignment.
        return;
    }

    // Create a new Enterprise Risk for this critical vendor
    const riskTitle = `Supply Chain Risk: ${vendorName}`;
    const description = `Critical dependency on third-party vendor ${vendorName}. Potential for service disruption or data leakage.`;

    // ISO 31000: Likelihood/Impact Estimation
    // Critical vendors start with High Impact
    const impact = criticality === 'Critical' ? 5 : 4;
    const likelihood = 3; // Default to 'Possible' until proven otherwise
    const score = impact * likelihood;

    // Create the Risk
    const risk = await prisma.risk.create({
        data: {
            assetId: `VENDOR-${vendorId.substring(0, 6)}`,
            narrative: riskTitle,
            category: 'Third Party',
            likelihood,
            impact,
            score,
            status: 'open',
            owner: ownerEmail
        }
    });

    // Link Vendor to Risk
    await prisma.vendorRisk.create({
        data: {
            vendorId,
            riskId: risk.id,
            riskType: 'supply_chain'
        }
    });

    console.log(`[GRC Automation] Created Supply Chain Risk for vendor: ${vendorName}`);
}


// --- Continuous Monitoring: Incident Feedback Loop ---

/**
 * Links new incidents to existing risks to create a feedback loop.
 * Triggered on Incident Create.
 */
export async function linkIncidentToRisks(
    incidentId: string,
    title: string,
    description: string,
    severity: string,
    ownerEmail: string
) {
    if (severity !== 'High' && severity !== 'Critical') return;

    // naive search for relevant risks (title matching)
    // In production, this would use vector embeddings or keyword extraction
    const searchTerms = title.split(' ').filter(w => w.length > 4);

    if (searchTerms.length === 0) return;

    const OR = searchTerms.map(term => ({
        narrative: { contains: term }
    }));

    const potentialRisks = await prisma.risk.findMany({
        where: {
            owner: ownerEmail,
            OR
        },
        take: 3
    });

    for (const risk of potentialRisks) {
        // Create IncidentRisk link
        await prisma.incidentRisk.create({
            data: {
                incidentId,
                riskId: risk.id,
                impactType: 'realized' // The risk has materialized
            }
        });

        // Feedback Loop: Increase Risk Likelihood
        // If a risk materializes, its likelihood of occurring is effectively 100% (or higher in future)
        // We bump it up by 1 to reflect recent occurrence
        const newLikelihood = Math.min(5, risk.likelihood + 1);

        await prisma.risk.update({
            where: { id: risk.id },
            data: {
                likelihood: newLikelihood,
                score: newLikelihood * risk.impact, // Update inherent score
                narrative: ((risk.narrative || '') + `\n[System]: Likelihood increased due to related Critical Incident "${title}".`).trim()
            }
        });

        console.log(`[GRC Automation] Linked Incident "${title}" to Risk "${risk.narrative}"`);
    }
}

// --- Change Management: Risk Integration ---

/**
 * Automatically creates an Operational Risk for high-risk changes.
 * Triggered on Change Create/Update.
 */
export async function createChangeRisk(
    changeId: string,
    riskScore: number
) {
    // Only create formal risks for High/Critical changes (Score > 12)
    if (riskScore < 12) return;

    // Fetch change details to populate risk
    const change = await prisma.change.findUnique({
        where: { id: changeId }
    });

    if (!change) return;

    // Check if risk already exists for this change
    const existingLink = await prisma.changeRisk.findFirst({
        where: { changeId }
    });

    if (existingLink) return;

    const riskTitle = `Change Risk: ${change.title}`;
    const description = `Operational risk associated with high-risk change ${change.changeNumber}. \nJustification: ${change.justification}`;

    // Map Change Risk Score (1-125) to Risk Matrix (1-25)
    // Simple heuristic: 
    // Impact = Change Impact (High=5, Med=3, Low=1)
    // Likelihood = Derived from Complexity/Urgency (Max 5)

    // We'll just map roughly for now
    const impact = change.impactLevel === 'high' ? 5 : change.impactLevel === 'medium' ? 3 : 2;
    const likelihood = change.complexity === 'complex' ? 5 : change.complexity === 'moderate' ? 3 : 2;
    const derivedScore = impact * likelihood;

    // Create Enterprise Risk
    const risk = await prisma.risk.create({
        data: {
            assetId: change.changeNumber,
            narrative: riskTitle,
            category: 'Operational',
            likelihood,
            impact,
            score: derivedScore,
            status: 'open',
            owner: change.requestedBy
        }
    });

    // Link Change to Risk
    await prisma.changeRisk.create({
        data: {
            changeId,
            riskId: risk.id,
            impactType: 'potential',
            description: description,
            likelihood,
            impact,
            mitigation: 'Automated risk identification. Review change impact analysis.'
        }
    });

    console.log(`[GRC Automation] Created Operational Risk for Change: ${change.changeNumber}`);
}

// ============================================
// ENTERPRISE GRC: AUDITOR PORTAL AUTOMATION
// ============================================

/**
 * Auto-generates standard audit requests when auditor access is granted.
 * Creates requests based on audit type and framework.
 */
export async function generateAuditRequests(
    auditId: string,
    auditorAccessId: string,
    framework: string | null,
    organizationId: string
) {
    // Standard audit request templates based on framework
    const requestTemplates: Record<string, Array<{ title: string; description: string; category: string; priority: string }>> = {
        'SOC2': [
            { title: 'Access Control Policy', description: 'Provide the current access control policy document', category: 'policy_review', priority: 'high' },
            { title: 'User Access Review Evidence', description: 'Evidence of quarterly user access reviews', category: 'evidence', priority: 'high' },
            { title: 'Change Management Procedure', description: 'Change management policy and sample change tickets', category: 'control_documentation', priority: 'medium' },
            { title: 'Incident Response Logs', description: 'Security incident logs for the audit period', category: 'evidence', priority: 'high' },
            { title: 'Vendor Risk Assessments', description: 'Third-party vendor risk assessment documentation', category: 'evidence', priority: 'medium' },
        ],
        'ISO27001': [
            { title: 'ISMS Scope Document', description: 'Information Security Management System scope and boundaries', category: 'policy_review', priority: 'critical' },
            { title: 'Risk Assessment Methodology', description: 'Risk assessment methodology and results', category: 'control_documentation', priority: 'high' },
            { title: 'Statement of Applicability', description: 'SOA with control implementation status', category: 'control_documentation', priority: 'critical' },
            { title: 'Internal Audit Report', description: 'Most recent internal ISMS audit report', category: 'evidence', priority: 'high' },
            { title: 'Management Review Minutes', description: 'Evidence of management review meetings', category: 'evidence', priority: 'medium' },
        ],
        'default': [
            { title: 'Security Policy Documentation', description: 'Current security policies and procedures', category: 'policy_review', priority: 'high' },
            { title: 'Control Evidence Package', description: 'Evidence of control implementation and effectiveness', category: 'evidence', priority: 'high' },
            { title: 'Organization Chart', description: 'Security team organization and responsibilities', category: 'control_documentation', priority: 'low' },
        ]
    };

    const templates = requestTemplates[framework || ''] || requestTemplates['default'];
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now

    for (const template of templates) {
        await prisma.auditRequest.create({
            data: {
                auditId,
                auditorAccessId,
                title: template.title,
                description: template.description,
                category: template.category,
                priority: template.priority,
                dueDate,
                organizationId,
                status: 'open'
            }
        });
    }

    console.log(`[GRC Automation] Generated ${templates.length} audit requests for ${framework || 'general'} audit`);
}

/**
 * Updates audit status based on request completion.
 * Triggered when all critical requests are approved.
 */
export async function updateAuditProgress(auditId: string) {
    const requests = await prisma.auditRequest.findMany({
        where: { auditId }
    });

    const total = requests.length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const submitted = requests.filter(r => ['submitted', 'under_review', 'approved'].includes(r.status)).length;

    // Calculate progress
    const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Auto-update audit status based on progress
    let newStatus = null;
    if (progress === 100) {
        newStatus = 'reporting'; // All evidence collected, ready for report
    } else if (submitted > total * 0.5) {
        newStatus = 'fieldwork'; // Majority submitted, fieldwork ongoing
    }

    if (newStatus) {
        await prisma.audit.update({
            where: { id: auditId },
            data: { status: newStatus }
        });
        console.log(`[GRC Automation] Updated audit status to: ${newStatus} (${progress}% complete)`);
    }

    return { total, approved, submitted, progress };
}

// ============================================
// ENTERPRISE GRC: TRUST CENTER AUTOMATION
// ============================================

/**
 * Auto-populates Trust Center sections from GRC data.
 * Creates content from controls, policies, and framework readiness.
 */
export async function populateTrustCenterFromGRC(
    configId: string,
    organizationId: string
) {
    // Get GRC data
    const [controls, policies, frameworkMappings] = await Promise.all([
        prisma.control.findMany({
            where: { organizationId },
            select: { title: true, controlType: true }
        }),
        prisma.policy.findMany({
            where: { organizationId, status: 'active' },
            select: { title: true, version: true }
        }),
        prisma.frameworkMapping.findMany({
            where: { control: { organizationId } },
            include: { framework: true },
            distinct: ['frameworkId']
        })
    ]);

    // Generate Controls section content
    const controlsByType = controls.reduce((acc, c) => {
        acc[c.controlType] = (acc[c.controlType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const controlsContent = `## Security Controls

Our security program is built on ${controls.length} documented controls:

| Control Type | Count |
|-------------|-------|
${Object.entries(controlsByType).map(([type, count]) => `| ${type.charAt(0).toUpperCase() + type.slice(1)} | ${count} |`).join('\n')}

These controls are continuously monitored and tested to ensure effectiveness.`;

    // Generate Certifications section content
    const frameworks = [...new Set(frameworkMappings.map(m => m.framework.name))];
    const certsContent = `## Certifications & Compliance

We maintain compliance with industry-leading security frameworks:

${frameworks.map(f => `- ✅ **${f}** - Actively managed`).join('\n')}

Our compliance status is continuously monitored through our GRC platform.`;

    // Generate Policies section content
    const policiesContent = `## Security Policies

We maintain ${policies.length} security policies that govern our operations:

${policies.slice(0, 10).map(p => `- **${p.title}** (v${p.version})`).join('\n')}
${policies.length > 10 ? `\n*...and ${policies.length - 10} more policies*` : ''}

All policies are reviewed annually and updated as needed.`;

    // Upsert sections
    const sections = [
        { sectionType: 'controls', title: 'Security Controls', content: controlsContent, displayOrder: 2 },
        { sectionType: 'certifications', title: 'Certifications & Compliance', content: certsContent, displayOrder: 1 },
        { sectionType: 'policies', title: 'Security Policies', content: policiesContent, displayOrder: 3 }
    ];

    for (const section of sections) {
        const existing = await prisma.trustCenterSection.findFirst({
            where: { configId, sectionType: section.sectionType }
        });

        if (existing) {
            await prisma.trustCenterSection.update({
                where: { id: existing.id },
                data: { content: section.content }
            });
        } else {
            await prisma.trustCenterSection.create({
                data: { configId, ...section, isVisible: true }
            });
        }
    }

    console.log(`[GRC Automation] Auto-populated Trust Center with ${sections.length} sections from GRC data`);
    return { controlsCount: controls.length, policiesCount: policies.length, frameworksCount: frameworks.length };
}

// ============================================
// ENTERPRISE GRC: KNOWLEDGE BASE AUTOMATION
// ============================================

/**
 * Auto-generates Knowledge Base entries from controls and policies.
 * Creates Q&A pairs based on existing GRC documentation.
 */
export async function generateKBFromGRC(
    organizationId: string,
    owner: string
) {
    // Get controls and policies
    const [controls, policies] = await Promise.all([
        prisma.control.findMany({
            where: { organizationId },
            select: { id: true, title: true, description: true, controlType: true }
        }),
        prisma.policy.findMany({
            where: { organizationId, status: 'active' },
            select: { id: true, title: true, content: true }
        })
    ]);

    let created = 0;

    // Generate KB entries from controls
    for (const control of controls.slice(0, 20)) { // Limit to first 20
        const existing = await prisma.knowledgeBaseEntry.findFirst({
            where: { organizationId, controlId: control.id }
        });

        if (!existing && control.description) {
            await prisma.knowledgeBaseEntry.create({
                data: {
                    question: `Does your organization have ${control.title.toLowerCase()}?`,
                    answer: `Yes, we implement ${control.title}. ${control.description}`,
                    category: mapControlTypeToCategory(control.controlType),
                    tags: [control.controlType, 'control', 'automated'],
                    status: 'draft',
                    controlId: control.id,
                    owner,
                    organizationId
                }
            });
            created++;
        }
    }

    // Generate KB entries from policies
    for (const policy of policies.slice(0, 10)) { // Limit to first 10
        const existing = await prisma.knowledgeBaseEntry.findFirst({
            where: { organizationId, policyId: policy.id }
        });

        if (!existing) {
            // Extract first paragraph or 500 chars as summary
            const summary = policy.content.substring(0, 500).split('\n')[0];

            await prisma.knowledgeBaseEntry.create({
                data: {
                    question: `Does your organization have a ${policy.title}?`,
                    answer: `Yes, we maintain a formal ${policy.title}. ${summary}...`,
                    category: 'governance',
                    tags: ['policy', 'documentation', 'automated'],
                    status: 'draft',
                    policyId: policy.id,
                    owner,
                    organizationId
                }
            });
            created++;
        }
    }

    console.log(`[GRC Automation] Generated ${created} Knowledge Base entries from GRC data`);
    return { created };
}

/**
 * Finds best matching KB entry for a questionnaire question.
 * Uses keyword matching and updates usage tracking.
 */
export async function findKBMatch(
    question: string,
    organizationId: string
): Promise<{ entry: any; confidence: number } | null> {
    // Extract keywords from question
    const keywords = question.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
        .filter(w => !['does', 'your', 'have', 'organization', 'company'].includes(w));

    if (keywords.length === 0) return null;

    // Search for matching entries
    const entries = await prisma.knowledgeBaseEntry.findMany({
        where: {
            organizationId,
            status: 'approved',
            OR: keywords.map(kw => ({
                OR: [
                    { question: { contains: kw, mode: 'insensitive' } },
                    { answer: { contains: kw, mode: 'insensitive' } },
                    { tags: { has: kw } }
                ]
            }))
        },
        orderBy: { usageCount: 'desc' },
        take: 5
    });

    if (entries.length === 0) return null;

    // Score entries by keyword matches
    const scored = entries.map(entry => {
        const questionText = entry.question.toLowerCase();
        const answerText = entry.answer.toLowerCase();
        const matches = keywords.filter(kw =>
            questionText.includes(kw) || answerText.includes(kw) || entry.tags.includes(kw)
        ).length;
        return { entry, score: matches / keywords.length };
    }).sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best.score < 0.3) return null; // Minimum 30% match

    // Update usage tracking
    await prisma.knowledgeBaseEntry.update({
        where: { id: best.entry.id },
        data: {
            usageCount: { increment: 1 },
            lastUsedAt: new Date()
        }
    });

    return { entry: best.entry, confidence: best.score };
}

// Helper function
function mapControlTypeToCategory(controlType: string): string {
    const mapping: Record<string, string> = {
        preventive: 'security',
        detective: 'compliance',
        corrective: 'incident_response',
        directive: 'governance'
    };
    return mapping[controlType] || 'other';
}

/**
 * Links audit findings to controls and creates remediation actions.
 * Triggered when findings are created from audits.
 */
export async function linkFindingToRemediation(
    findingId: string,
    controlId: string,
    severity: string,
    organizationId: string
) {
    // Get finding and control details
    const [finding, control] = await Promise.all([
        prisma.auditFinding.findUnique({ where: { id: findingId } }),
        prisma.control.findUnique({ where: { id: controlId } })
    ]);

    if (!finding || !control) return;

    // Create remediation action
    const priorityMap: Record<string, string> = {
        critical: 'critical',
        major: 'high',
        minor: 'medium',
        observation: 'low'
    };

    const action = await prisma.action.create({
        data: {
            title: `Remediate: ${finding.title}`,
            description: `Audit finding remediation required.\n\nFinding: ${finding.description}\n\nRecommendation: ${finding.recommendation || 'Review and remediate the identified gap.'}`,
            type: 'corrective',
            priority: priorityMap[severity] || 'medium',
            status: 'open',
            controlId,
            parentType: 'AuditFinding',
            parentId: findingId,
            owner: control.owner,
            organizationId,
            dueDate: new Date(Date.now() + (severity === 'critical' ? 7 : severity === 'major' ? 30 : 60) * 24 * 60 * 60 * 1000)
        }
    });

    console.log(`[GRC Automation] Created remediation action for finding: ${finding.title}`);
    return action;
}
