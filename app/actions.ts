'use server';

import OpenAI from 'openai';
import { CaseInput, GeneratedReport, LLMConfig } from '@/types';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { grcLLM } from '@/lib/llm/grc-service';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext } from '@/lib/isolation';

const PROVIDER_URLS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1',
  'deepseek': 'https://api.deepseek.com',
  'anthropic': 'https://api.anthropic.com/v1', // requires SDK usually, but sticking to openai compat check or fallback
  'google': 'https://generativelanguage.googleapis.com/v1beta/openai',
  'mistral': 'https://api.mistral.ai/v1'
};

import { createHash } from 'crypto'; // Built-in Node module

// ... (keep existing imports)

export async function generateReportAction(input: CaseInput, userEmail: string, llmConfig?: LLMConfig): Promise<GeneratedReport> {
  const context = await getIsolationContext();
  if (!context) {
    throw new Error("Unauthorized: Invalid session");
  }

  const DEV_MODE = process.env.DEV_MODE === 'true';
  const user = context;

  // Expert Tier: Use context role (fallback to user if not in DB yet, but context handles provisioning)
  // We'll trust the context to have handled user creation/finding.

  // 1. CONFIGURATION RESOLUTION (Vendor-Managed Priority)
  let openai: OpenAI;
  let config = llmConfig; // Kept for legacy/debug, but we prefer system config

  // Always try to load System Config (Vendor Key) first for Model 1
  if (!config?.apiKey) {
    const globalConfig = await getGlobalLLMConfig();
    if (globalConfig) {
      config = globalConfig;
    }
  }

  // Fallback to Env if no DB config
  if (!config?.apiKey) {
    config = { provider: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY || '' };
  }

  if (!config.apiKey) throw new Error("System LLM Configuration missing.");

  // 2. CACHING STRATEGY (Optimization Layer)
  // Create stable hash of input
  const promptContent = JSON.stringify({ ...input, targetFramework: input.targetFramework });
  const promptHash = createHash('sha256').update(promptContent).digest('hex');

  // Check Cache
  const cached = await prisma.lLMCache.findUnique({
    where: { promptHash }
  });

  // Check TTL (e.g., 7 days)
  if (cached && cached.expiresAt > new Date()) {
    console.log("CACHE HIT: Serving optimized response");
    // Metering for Cache Hit? Typically much cheaper or free.
    // We still log usage but with 0 cost to Vendor.
    await prisma.lLMUsage.create({
      data: {
        userId: user.id,
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

  // 3. GENERATION
  try {
    // Comprehensive prompt with clear JSON schema specification
    const promptText = `You are a Senior GRC (Governance, Risk, and Compliance) Auditor with 20+ years of experience at a Big 4 firm.
    
    Conduct a professional, detailed, and realistic ${input.targetFramework} compliance assessment for:
    - Company: ${input.companyName} (Industry: ${input.industry || 'Technology'})
    - Size: ${input.companySize}
    - Key Challenge: ${input.keyChallenge}

    Your assessment MUST be hyper-targeted to the provided Industry and Key Challenge. Avoid generic boilerplate (like "AWS" or "GitHub" unless they are the primary cause of the challenge). If the challenge is "Data Privacy in Healthcare", the incidents should be about HIPAA violations or EHR breaches, not generic phishing.
    
    The Vendors and Incidents you generate MUST be interconnected. For example, if you list a specific SaaS vendor, a generated incident might involve a breach at that vendor. 
    
    Use a professional consulting tone, focusing on "Business Risk" and "Material Impact".

    Respond ONLY with the JSON object.
    
    You MUST respond with a valid JSON object containing these exact fields:

    {
      "executiveSummary": {
        "problemStatement": "A professional assessment of the specific GRC challenges cited.",
        "context": "Organizational context and compliance scope.",
        "scope": "Specific systems, processes, and locations covered.",
        "recommendations": "Strategic roadmap for remediation (high-level)."
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
          "title": "Specific Control Name",
          "description": "Detailed description.",
          "controlType": "preventive" | "detective" | "corrective" | "directive",
          "status": "compliant" | "partially_compliant" | "non_compliant" | "not_applicable"
        }
      ],
      "risks": [
        {
          "category": "Strategic" | "Operational" | "Financial" | "Compliance" | "Reputational",
          "narrative": "Detailed risk scenario.",
          "likelihood": 1-5,
          "impact": 1-5,
          "mitigatingControlTitles": ["Exact Title of Control"],
          "recommendedActions": [
            { "title": "Action Title", "priority": "high" | "medium" | "low" }
          ]
        }
      ],
      "gaps": [
        {
          "title": "Gap Title",
          "description": "Gap description.",
          "severity": "critical" | "high" | "medium" | "low",
          "remediationPlan": "Detailed steps",
          "effort": "high" | "medium" | "low",
          "timeline": "e.g., 30 days"
        }
      ],
      "policies": [
        {
          "title": "Policy Name",
          "category": "e.g., Security, Privacy",
          "description": "Policy summary",
          "status": "active" | "draft" | "review"
        }
      ],
      "vendors": [
        {
          "name": "Vendor Name",
          "category": "Category",
          "services": "Critical services",
          "riskScore": 0-100
        }
      ],
      "incidents": [
        {
          "title": "Incident Title",
          "description": "Description.",
          "severity": "low" | "medium" | "high" | "critical",
          "status": "resolved" | "investigating" | "open"
        }
      ]
    }

    Requirements:
    1. Generate 6-8 comprehensive controls strictly specific to ${input.targetFramework}.
    2. Identify 4-5 top risks. CRITICAL: For each risk, listed in "mitigatingControlTitles", you MUST include the EXACT titles of 1-2 controls from your "controls" list that help mitigate this risk.
    3. For each risk, provide 1-2 specific "recommendedActions".
    4. List 3 realistic vendors that are CRITICAL to this company's industry and operations. Do not just use AWS/GitHub unless they are the most relevant. Use industry leaders (e.g., Epic for Healthcare, Bloomberg for Finance, etc.).
    5. Create 2 plausible incident scenarios that are directly triggered by the "Key Challenge" or involve the listed "Vendors".
    6. Ensure the entire assessment tells a consistent story about the organization's current posture.

    Respond ONLY with the JSON object.`;

    console.log('[generateReportAction] Calling LLM with prompt length:', promptText.length);

    const result = await grcLLM.generateReport(promptText, config);
    const parsedContent = result.data;

    console.log('[generateReportAction] LLM Response:', JSON.stringify(parsedContent).substring(0, 500));

    // 4. METERING (Cost Tracking)
    const usage = result.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;

    // Est. Cost Calculation (e.g. DeepSeek pricing or generic)
    // $0.14/1M input, $0.28/1M output (Example DeepSeek V2 pricing)
    const estimatedCost = (inputTokens * 0.00000014) + (outputTokens * 0.00000028);

    await prisma.lLMUsage.create({
      data: {
        userId: user.id,
        model: result.provenance.model,
        tokensIn: inputTokens,
        tokensOut: outputTokens,
        cost: estimatedCost,
        feature: 'report_generation'
      }
    });

    // 5. CACHE WRITE
    // We cache the raw data (parsedContent) as string
    await prisma.lLMCache.upsert({
      where: { promptHash },
      update: { response: JSON.stringify(parsedContent), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
      create: {
        promptHash,
        response: JSON.stringify(parsedContent),
        model: result.provenance.model,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // 6. PERSISTENCE LAYER (SaaS Upgrade)
    // Explode the report into granular DB records for the Dashboard
    try {
      const { persistReportData } = await import('@/lib/services/ai-mapper');
      await persistReportData(user.id, parsedContent);
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

// Fallback demo data generator for when LLM is unavailable
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
    incidents: [
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

export async function applyReportToPlatform(report: GeneratedReport, clearData: boolean = false, userEmail: string, framework: string = 'ISO 27001') {
  const context = await getIsolationContext();
  if (!context) {
    throw new Error("Unauthorized: Invalid session");
  }

  const effectiveEmail = context.email;
  const orgId = context.orgId;

  const data = report.sections;

  try {
    // 1. Optional Cleanup (outside transaction for safety)
    // 1. Optional Cleanup (strictly scoped)
    if (clearData) {
      await prisma.policy.deleteMany({ where: { owner: effectiveEmail } });
      await prisma.control.deleteMany({ where: { owner: effectiveEmail } });
      await prisma.risk.deleteMany({ where: { owner: effectiveEmail } });
      await prisma.vendor.deleteMany({ where: { owner: effectiveEmail } });
      await prisma.action.deleteMany({ where: { owner: effectiveEmail } });
      await prisma.incident.deleteMany({ where: { reportedBy: effectiveEmail } });
    }

    // Map to store Control Title -> DB ID
    const controlMap = new Map<string, string>();

    // 2. Insert Controls (Sequential to capture IDs)
    if (data.controls && Array.isArray(data.controls)) {
      for (const c of data.controls) {
        const created = await prisma.control.create({
          data: {
            title: c.title || 'Control',
            description: c.description || c.title || 'Security control',
            controlType: c.controlType || 'preventive',
            controlRisk: 'medium',
            organizationId: orgId,
            owner: effectiveEmail
          }
        });
        controlMap.set(c.title, created.id);
      }
    }

    // 3. Insert Risks and Link to Controls
    if (data.risks && Array.isArray(data.risks)) {
      for (const r of data.risks) {
        // Create Risk
        const createdRisk = await prisma.risk.create({
          data: {
            category: r.category || 'General',
            narrative: r.narrative || 'Identified risk',
            likelihood: r.likelihood || 3,
            impact: r.impact || 3,
            score: (r.likelihood || 3) * (r.impact || 3),
            status: 'open',
            owner: effectiveEmail,
            organizationId: orgId,
            recommendedActions: JSON.stringify(r.recommendedActions || [])
          }
        });

        // Link Rules (RiskControl)
        if (r.mitigatingControlTitles && Array.isArray(r.mitigatingControlTitles)) {
          for (const title of r.mitigatingControlTitles) {
            const controlId = controlMap.get(title);
            if (controlId) {
              // Verify uniqueness before insert to avoid crash? 
              // create unique
              try {
                await prisma.riskControl.create({
                  data: {
                    riskId: createdRisk.id,
                    controlId: controlId,
                    effectiveness: 'partial'
                  }
                });
              } catch (e) { /* ignore duplicate linking */ }
            }
          }
        }

        // Create Actions linked to this Risk
        if (r.recommendedActions && Array.isArray(r.recommendedActions)) {
          for (const action of r.recommendedActions) {
            await prisma.action.create({
              data: {
                title: action.title || 'Mitigate Risk',
                type: 'corrective',
                description: `Action to mitigate risk: ${r.narrative?.substring(0, 100)}...`,
                status: 'open',
                priority: action.priority || 'high',
                owner: effectiveEmail,
                organizationId: orgId,
                parentType: 'Risk',
                parentId: createdRisk.id
              }
            });
          }
        }
      }
    }

    // 4. Vendors
    if (data.vendors && Array.isArray(data.vendors) && data.vendors.length > 0) {
      await prisma.vendor.createMany({
        data: data.vendors.map((v: any) => ({
          name: v.name || 'Vendor',
          category: v.category || 'General',
          services: v.services || 'Services',
          riskScore: v.riskScore || 50,
          status: 'active',
          owner: effectiveEmail,
          organizationId: orgId
        }))
      });
    }

    // 5. Incidents
    if (data.incidents && Array.isArray(data.incidents) && data.incidents.length > 0) {
      await prisma.incident.createMany({
        data: data.incidents.map((i: any) => ({
          title: i.title || 'Incident',
          description: i.description || 'Description',
          severity: i.severity || 'medium',
          status: i.status || 'open',
          reportedBy: effectiveEmail,
          organizationId: orgId
        }))
      });
    }

    // 6. Gaps Analysis (Phase 1 Enhancement)
    if (data.gaps && Array.isArray(data.gaps) && data.gaps.length > 0) {
      for (const gap of data.gaps) {
        await prisma.gap.create({
          data: {
            title: gap.title || 'Compliance Gap',
            description: gap.description || 'Identified gap in compliance.',
            severity: gap.severity || 'medium',
            framework: framework,
            remediationPlan: gap.remediationPlan,
            effort: gap.effort,
            timeline: gap.timeline,
            organizationId: orgId,
            owner: effectiveEmail
          }
        });
      }
    }

    // 7. Policies (Phase 1 Enhancement)
    if (data.policies && Array.isArray(data.policies) && data.policies.length > 0) {
      await prisma.policy.createMany({
        data: data.policies.map((p: any) => ({
          title: p.title || 'Policy',
          content: p.description || 'Policy content.',
          category: p.category || 'Security',
          status: p.status || 'draft',
          owner: effectiveEmail,
          organizationId: orgId
        }))
      });
    } else if (data.controls && data.controls.length > 0) {
      // Fallback: Create one if none generated
      await prisma.policy.create({
        data: {
          title: 'Information Security Policy',
          version: '1.0',
          content: 'This policy establishes security controls and risk management.',
          status: 'draft',
          owner: effectiveEmail,
          organizationId: orgId,
          reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // 8. Audit the push operation
    await logAudit({
      entity: 'Assessment',
      entityId: 'PUSH_TO_PLATFORM',
      action: 'PUSH',
      changes: {
        framework: framework,
        controlCount: data.controls?.length || 0,
        riskCount: data.risks?.length || 0
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('applyReportToPlatform error:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
}

// ==========================================
// SYSTEM CONFIGURATION ACTIONS
// ==========================================

// Helper to get global config
async function getGlobalLLMConfig() {
  const adminConfig = await prisma.systemSetting.findFirst({
    where: {
      key: 'llm_config',
      user: { role: 'admin' }
    },
    include: { user: true }
  });

  if (adminConfig) {
    return JSON.parse(adminConfig.value) as LLMConfig;
  }
  return null;
}

export async function getSystemConfig() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fetch user from DB to get role using unique ID lookup
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });

  if (!dbUser) return null;

  // If Admin, return THEIR config.
  if (dbUser.role === 'admin') {
    const setting = await prisma.systemSetting.findUnique({
      where: {
        userId_key: {
          userId: dbUser.id,
          key: 'llm_config'
        }
      }
    });
    return setting ? JSON.parse(setting.value) : null;
  } else {
    // For others, return masked global config if it exists
    const globalConfig = await getGlobalLLMConfig();
    if (globalConfig) {
      return { provider: globalConfig.provider, apiKey: '********', isManaged: true };
    }
  }
  return null;
}

export async function saveSystemConfig(config: LLMConfig) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Invalid session");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error("Unauthorized: Only Admins can update system configuration");
  }

  await prisma.systemSetting.upsert({
    where: {
      userId_key: {
        userId: dbUser.id,
        key: 'llm_config'
      }
    },
    update: {
      value: JSON.stringify(config),
      isSecret: true
    },
    create: {
      userId: dbUser.id,
      key: 'llm_config',
      value: JSON.stringify(config),
      isSecret: true
    }
  });

  return { success: true };
}

export async function upgradeSubscription(planId: string, email?: string) {
  const { userId } = await auth();

  // Fetch user from Clerk or use provided email
  let targetEmail = email;
  if (userId && !targetEmail) {
    const clerkUser = await currentUser();
    targetEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  }

  if (!targetEmail) {
    throw new Error("Unauthorized: No email provided for subscription upgrade.");
  }

  // Find or Create User (Simulated "Guest" Account Provisioning)
  let user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { organization: true }
  });

  if (!user) {
    // Create a user on the fly if they don't exist
    user = await prisma.user.create({
      data: {
        id: userId || undefined, // Link to Clerk user if available
        email: targetEmail,
        name: targetEmail.split('@')[0],
        role: 'admin', // First user is admin
      },
      include: { organization: true }
    });
  }

  // Determine limits based on plan
  let limit = 5;
  let planName = 'FREE';

  if (planId === 'solo') {
    limit = 20;
    planName = 'SOLO';
  } else if (planId === 'business') {
    limit = 100;
    planName = 'BUSINESS';
  } else if (planId === 'enterprise') {
    limit = 999999;
    planName = 'ENTERPRISE';
  }

  // Update or Create Organization
  if (user.orgId) {
    await prisma.organization.update({
      where: { id: user.orgId },
      data: {
        plan: planName,
        assessmentLimit: limit,
        billingCycle: 'MONTHLY',
        subscriptionStatus: 'ACTIVE',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  } else {
    // Create new org if user doesn't have one
    const newOrg = await prisma.organization.create({
      data: {
        name: `${user.name || 'User'}'s Organization`,
        plan: planName,
        assessmentLimit: limit,
        users: { connect: { id: user.id } }
      }
    });
    // Force update user role to admin of their new org
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin', orgId: newOrg.id }
    });
  }

  return { success: true, plan: planName };
}
