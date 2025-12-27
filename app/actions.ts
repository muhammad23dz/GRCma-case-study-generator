'use server';

import OpenAI from 'openai';
import { CaseInput, GeneratedReport, LLMConfig } from '@/types';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { grcLLM } from '@/lib/llm/grc-service';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext } from '@/lib/isolation';
import { generateReportService } from '@/lib/services/report-generator';

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

  // Delegate business logic to the service
  return await generateReportService(input, { userId: context.userId }, llmConfig);
}

export async function applyReportToPlatform(report: GeneratedReport, clearData: boolean = false, userEmail: string, framework: string = 'ISO 27001') {
  // Try getIsolationContext first
  let context = await getIsolationContext();

  // Fallback: If context is null, try to resolve user directly
  if (!context) {
    console.log('[applyReportToPlatform] getIsolationContext returned null, trying direct auth...');
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized: Invalid session");
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || userEmail;

    // Find or create user
    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser && email) {
      dbUser = await prisma.user.findUnique({ where: { email } });
    }
    if (!dbUser && email) {
      console.log('[applyReportToPlatform] Auto-provisioning user:', email);
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: user?.fullName || 'User',
          role: 'user'
        }
      });
    }

    if (!dbUser) {
      throw new Error("Unauthorized: Could not resolve user");
    }

    context = {
      userId: dbUser.id,
      clerkId: userId,
      email: dbUser.email || email,
      orgId: dbUser.orgId,
      role: dbUser.role || 'user',
      securitySettings: undefined
    };
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
