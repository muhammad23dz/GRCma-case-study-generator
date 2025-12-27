import { CaseInput, GeneratedReport, LLMConfig } from '@/types';
import { grcLLM } from '@/lib/llm/grc-service';
import { createHash } from 'crypto';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

/**
 * Service to handle report generation logic.
 * Decoupled from Server Actions to allow calling from API routes with explicit context.
 */
export async function generateReportService(
    input: CaseInput,
    userContext: { userId: string },
    llmConfig?: LLMConfig
): Promise<GeneratedReport> {

    // 1. CONFIGURATION RESOLUTION
    let config = llmConfig;

    // Always try to load System Config (Vendor Key) first if not provided
    if (!config?.apiKey) {
        // We'll trust the caller to have handled system config resolution if needed, 
        // OR we can fetch it here if we had access to the helper.
        // For simplicity, we rely on env or passed config here, 
        // repeating the logic from the action but scoped to the service.

        // Note: Ideally, we'd fetch the system setting for the admin who owns the org, 
        // but for now we'll fallback to env vars if no config provided.
    }

    // Fallback to Env
    if (!config?.apiKey) {
        config = { provider: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY || '' };
    }

    if (!config?.apiKey) {
        console.warn("System LLM Config missing - Generating fallback demo data.");
        // Non-fatal fallback for unconfigured environments
        const fallbackData = generateFallbackGRCData(input);
        return {
            id: crypto.randomUUID(),
            sections: fallbackData,
            timestamp: new Date().toISOString()
        };
    }

    // 2. CACHING STRATEGY (only if DB is available)
    const promptContent = JSON.stringify({ ...input, targetFramework: input.targetFramework });
    const promptHash = createHash('sha256').update(promptContent).digest('hex');

    if (hasValidDb) {
        try {
            const { prisma } = await import('@/lib/prisma');

            const cached = await prisma.lLMCache.findUnique({
                where: { promptHash }
            });

            if (cached && cached.expiresAt > new Date()) {
                console.log("CACHE HIT: Serving optimized response");
                await prisma.lLMUsage.create({
                    data: {
                        userId: userContext.userId,
                        model: 'cache-hit',
                        tokensIn: 0,
                        tokensOut: 0,
                        cost: 0,
                        feature: 'report_generation'
                    }
                });

                const data = JSON.parse(cached.response);
                return {
                    id: crypto.randomUUID(),
                    sections: data,
                    timestamp: new Date().toISOString()
                };
            }
        } catch (cacheError) {
            console.warn('[ReportGenerator] Cache lookup failed, proceeding with generation:', cacheError);
        }
    }

    // 3. GENERATION PROFILE
    const promptText = `You are a Senior GRC (Governance, Risk, and Compliance) Auditor with 20+ years of experience at a Big 4 firm (Deloitte, PwC, EY, KPMG).
    
    CRITICAL CONTEXT:
    - Company: "${input.companyName}"
    - Industry: "${input.industry || 'Technology'}"
    - Company Size: "${input.companySize}"
    - Target Framework: "${input.targetFramework}"
    - Key Challenge: "${input.keyChallenge}"

    STRICT REQUIREMENTS FOR LOGICAL COHERENCE:
    
    1. EVERYTHING must be directly relevant to "${input.industry || 'Technology'}" industry and "${input.keyChallenge}":
       - If healthcare: Use HIPAA, EHR systems, PHI, medical device vendors
       - If finance: Use SOX, PCI-DSS, trading systems, financial data vendors
       - If retail: Use PCI-DSS, POS systems, e-commerce, payment processors
       - If manufacturing: Use OT/ICS security, supply chain, SCADA systems
    
    2. CONTROLS must directly address "${input.keyChallenge}":
       - Each control title should mention specific aspects of the challenge
       - Control descriptions should explain HOW they mitigate the stated challenge
    
    3. RISKS must be realistic scenarios for "${input.companyName}":
       - Narratives should describe plausible threat scenarios specific to this company
       - Risk scores should reflect actual likelihood for this industry/size
       - Small companies (1-50) face different risks than enterprises (1000+)
    
    4. VENDORS must be industry-specific and realistic:
       - Healthcare: Epic, Cerner, Meditech, Allscripts (not generic AWS)
       - Finance: Bloomberg, Refinitiv, FIS, Jack Henry
       - Retail: Shopify, Square, Lightspeed, Oracle Retail
       - Manufacturing: Siemens, Rockwell, Honeywell, SAP
       - Technology: Specific SaaS tools relevant to stated challenge
    
    5. INCIDENTS must be causally linked to VENDORS or the KEY CHALLENGE:
       - Each incident should reference a specific vendor breach or challenge failure
       - Describe realistic attack vectors for this industry
    
    6. GAPS must show clear remediation paths tied to CONTROLS:
       - Each gap should identify which controls need implementation
       - Timeline and effort should be realistic for "${input.companySize}" company

    COHERENCE CHECK (You MUST ensure this):
    - Every Risk has mitigatingControlTitles that EXACTLY match control titles you generated
    - Every Incident is traceable to a Vendor or the Key Challenge
    - Every Gap has a remediation plan that referencing specific controls
    - The Executive Summary ties everything together into a coherent story

    Respond with a VALID JSON object containing these exact fields:

    {
      "executiveSummary": {
        "problemStatement": "2-3 sentences describing how ${input.keyChallenge} specifically impacts ${input.companyName} in the ${input.industry || 'Technology'} sector.",
        "context": "The organizational context: company size (${input.companySize}), regulatory requirements for ${input.industry || 'Technology'}, and compliance scope.",
        "scope": "Specific systems, processes, and departments covered by this ${input.targetFramework} assessment.",
        "recommendations": "3-4 prioritized strategic recommendations to address ${input.keyChallenge}."
      },
      "complianceMetrics": {
        "complianceScore": 0-100,
        "maturityLevel": "Initial" | "Developing" | "Defined" | "Managed" | "Optimizing",
        "auditReadiness": 0-100,
        "dimensionScores": {
          "documentation": 0-100,
          "evidence": 0-100,
          "policies": 0-100,
          "technical": 0-100
        }
      },
      "controls": [
        {
          "title": "Control name specific to ${input.targetFramework} and ${input.keyChallenge}",
          "description": "Detailed description of how this control addresses ${input.keyChallenge}.",
          "controlType": "preventive" | "detective" | "corrective" | "directive",
          "status": "compliant" | "partially_compliant" | "non_compliant" | "not_applicable"
        }
      ],
      "risks": [
        {
          "category": "Strategic" | "Operational" | "Financial" | "Compliance" | "Reputational",
          "narrative": "Detailed risk scenario specific to ${input.companyName} and ${input.keyChallenge}.",
          "likelihood": 1-5,
          "impact": 1-5,
          "mitigatingControlTitles": ["EXACT title from controls array above"],
          "recommendedActions": [
            { "title": "Specific action title", "priority": "high" | "medium" | "low" }
          ]
        }
      ],
      "gaps": [
        {
          "title": "Gap title related to ${input.keyChallenge}",
          "description": "Description of the compliance gap.",
          "severity": "critical" | "high" | "medium" | "low",
          "remediationPlan": "Specific steps referencing controls above",
          "effort": "high" | "medium" | "low",
          "timeline": "Realistic timeline for ${input.companySize} company"
        }
      ],
      "policies": [
        {
          "title": "Policy name relevant to ${input.targetFramework}",
          "category": "Category relevant to ${input.keyChallenge}",
          "description": "Policy purpose and scope",
          "status": "active" | "draft" | "review"
        }
      ],
      "vendors": [
        {
          "name": "Real vendor name specific to ${input.industry || 'Technology'} industry",
          "category": "Vendor category",
          "services": "Critical services this vendor provides",
          "riskScore": 0-100
        }
      ],
      "incidents": [
        {
          "title": "Incident title referencing a vendor or ${input.keyChallenge}",
          "description": "Incident description with realistic attack vector for ${input.industry || 'Technology'}.",
          "severity": "low" | "medium" | "high" | "critical",
          "status": "resolved" | "investigating" | "open"
        }
      ]
    }

    FINAL REQUIREMENTS:
    1. Generate 6-8 controls strictly specific to ${input.targetFramework} addressing ${input.keyChallenge}
    2. Generate 4-5 risks with mitigatingControlTitles that EXACTLY match your control titles
    3. Generate 3 industry-specific vendors (NOT generic cloud providers unless directly relevant)
    4. Generate 2 incidents causally linked to vendors or the key challenge
    5. Generate 2-3 gaps with remediation plans referencing your controls
    6. Generate 3-4 policies appropriate for ${input.targetFramework}
    
    The assessment must tell a coherent, interconnected story specific to "${input.companyName}" facing "${input.keyChallenge}" in the "${input.industry || 'Technology'}" industry.

    Respond ONLY with the JSON object.`;

    try {
        console.log('[generateReportService] Calling LLM...');
        const result = await grcLLM.generateReport(promptText, config);
        const parsedContent = result.data;

        // 4. METERING & 5. CACHE WRITE (only if DB is available)
        if (hasValidDb) {
            try {
                const { prisma } = await import('@/lib/prisma');

                const usage = result.usage;
                const inputTokens = usage?.prompt_tokens || 0;
                const outputTokens = usage?.completion_tokens || 0;
                const estimatedCost = (inputTokens * 0.00000014) + (outputTokens * 0.00000028);

                await prisma.lLMUsage.create({
                    data: {
                        userId: userContext.userId,
                        model: result.provenance.model,
                        tokensIn: inputTokens,
                        tokensOut: outputTokens,
                        cost: estimatedCost,
                        feature: 'report_generation'
                    }
                });

                // CACHE WRITE
                await prisma.lLMCache.upsert({
                    where: { promptHash },
                    update: { response: JSON.stringify(parsedContent), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                    create: {
                        promptHash,
                        response: JSON.stringify(parsedContent),
                        model: result.provenance.model,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    }
                });
            } catch (dbError) {
                console.warn('[ReportGenerator] Metering/caching failed:', dbError);
            }
        }

        // 6. PERSISTENCE LAYER
        try {
            const { persistReportData } = await import('@/lib/services/ai-mapper');
            await persistReportData(userContext.userId, parsedContent);
        } catch (persistErr) {
            console.error("Persistence Warning:", persistErr);
        }

        return {
            id: crypto.randomUUID(),
            sections: parsedContent,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error("LLM Generation Error:", error);

        // FALLBACK: Generate demo data when LLM fails
        console.log("Generating fallback demo data for testing...");
        const fallbackData = generateFallbackGRCData(input);

        return {
            id: crypto.randomUUID(),
            sections: fallbackData,
            timestamp: new Date().toISOString()
        };
    }
}

// Fallback demo data generator (Copied from actions.ts)
function generateFallbackGRCData(input: CaseInput) {
    const framework = input.targetFramework || 'ISO 27001';
    const company = input.companyName || 'Demo Company';
    const challenge = input.keyChallenge || 'compliance and security challenges';
    const industry = input.industry?.toLowerCase() || 'technology';

    // Industry-specific vendor/incident templates
    const industryTemplates: any = {
        healthcare: {
            vendors: [{ name: 'Epic Systems', category: 'EHR', services: 'Electronic Health Records Hosting', riskScore: 15 }],
            incidents: [{ title: 'Unauthorized PHI Access', description: 'Internal audit discovered unauthorized access to patient health information.', severity: 'critical' }]
        },
        finance: {
            vendors: [{ name: 'Bloomberg', category: 'Data', services: 'Market Data and Analytics', riskScore: 10 }],
            incidents: [{ title: 'SWIFT Message Discrepancy', description: 'Anomaly detected in international payment messaging queue.', severity: 'high' }]
        },
        manufacturing: {
            vendors: [{ name: 'SAP', category: 'ERP', services: 'Supply Chain Management', riskScore: 20 }],
            incidents: [{ title: 'OT Segment Intrusion', description: 'Suspicious lateral movement detected in the factory floor VLAN.', severity: 'high' }]
        },
        retail: {
            vendors: [{ name: 'Shopify', category: 'E-commerce', services: 'Storefront and Payment Processing', riskScore: 12 }],
            incidents: [{ title: 'POS Malware Outbreak', description: 'Point-of-sale terminals in three regions reported suspicious outbound traffic.', severity: 'critical' }]
        }
    };

    const template = industryTemplates[industry] || {
        vendors: [{ name: 'CloudSecure Inc', category: 'Infrastructure', services: 'IaaS Hosting', riskScore: 25 }],
        incidents: [{ title: 'Security Perimeter Breach', description: 'External firewall bypassed during a coordinated DDoS attack.', severity: 'high' }]
    };

    return {
        executiveSummary: {
            problemStatement: `${company} in the ${industry} sector is facing ${challenge}. This directly impacts the organization's ability to maintain ${framework} compliance.`,
            context: `The specific regulatory and operational context of ${industry} necessitates a robust approach to ${framework}.`,
            scope: `Comprehensive review of ${framework} controls as applied to ${company}'s core business units.`,
            recommendations: `Address critical gaps in ${template.incidents[0].title.toLowerCase()} prevention and strengthen ${template.vendors[0].name} oversight.`
        },
        controls: [
            {
                title: `${framework} Access Control Policy`,
                description: `Implement strict access controls tailored for ${industry} data types.`,
                controlType: 'preventive'
            },
            {
                title: 'Industry-Specific Encryption',
                description: `Encryption standards aligned with ${industry} regulatory requirements (e.g., AES-GCM-256).`,
                controlType: 'preventive'
            },
            {
                title: 'Continuous Monitoring',
                description: 'Real-time detection of anomalies in production environments.',
                controlType: 'detective'
            }
        ],
        risks: [
            {
                category: 'Compliance',
                narrative: `Failure to adhere to ${framework} within the ${industry} context leads to significant legal exposure.`,
                likelihood: 3,
                impact: 5
            },
            {
                category: 'Operational',
                narrative: `Business interruption related to ${challenge} could halt core operations for ${company}.`,
                likelihood: 4,
                impact: 4
            }
        ],
        vendors: [
            ...template.vendors,
            { name: 'Generic IT Provider', category: 'Managed Services', services: 'Helpdesk and RMM', riskScore: 30 }
        ],
        incidents: [ // Fixed incomplete array
            {
                ...template.incidents[0],
                status: 'investigating'
            },
            {
                title: 'Late Patching Cycle',
                description: 'Vulnerability scan identified critical systems without security updates for >30 days.',
                severity: 'medium',
                status: 'open'
            }
        ]
    };
}
