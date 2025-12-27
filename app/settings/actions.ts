'use server';

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ==========================================
// MFA & SECURITY SETTINGS
// ==========================================

export async function toggleMFA(enabled: boolean) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.user.upsert({
            where: { id: userId },
            create: { id: userId, mfaEnabled: enabled },
            update: { mfaEnabled: enabled }
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle MFA:", error);
        return { success: false, error: "Failed to update MFA settings" };
    }
}

export async function updateOrganizationSecuritySettings(settings: any) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { orgId: true, role: true }
        });

        if (!dbUser || !dbUser.orgId) throw new Error("Organization not found");
        if (!['admin', 'manager'].includes(dbUser.role || '')) throw new Error("Forbidden");

        await prisma.organization.update({
            where: { id: dbUser.orgId },
            data: { securitySettings: settings }
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update org settings:", error);
        return { success: false, error: "Failed to update organization settings" };
    }
}

export async function updateSessionTimeout(timeout: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key: 'session_timeout' } },
            create: { userId, key: 'session_timeout', value: timeout, description: 'Session timeout duration' },
            update: { value: timeout }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update session timeout:", error);
        return { success: false };
    }
}

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================

export async function updateNotificationStub(key: string, enabled: boolean) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key: `notifications_${key}` } },
            create: { userId, key: `notifications_${key}`, value: String(enabled), description: "User notification preference" },
            update: { value: String(enabled) }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update notification:", error);
        return { success: false, error: "Failed to update notification settings" };
    }
}

// ==========================================
// COMPLIANCE SETTINGS
// ==========================================

export async function updateComplianceSetting(key: string, value: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key: `compliance_${key}` } },
            create: { userId, key: `compliance_${key}`, value, description: `Compliance setting: ${key}` },
            update: { value }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update compliance setting:", error);
        return { success: false };
    }
}

export async function updateDefaultFrameworks(frameworks: string[]) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key: 'compliance_defaultFrameworks' } },
            create: { userId, key: 'compliance_defaultFrameworks', value: frameworks.join(','), description: 'Default compliance frameworks' },
            update: { value: frameworks.join(',') }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update frameworks:", error);
        return { success: false };
    }
}

// ==========================================
// DATA & PRIVACY SETTINGS
// ==========================================

export async function updateDataRetention(retention: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key: 'data_retention' } },
            create: { userId, key: 'data_retention', value: retention, description: 'Data retention policy' },
            update: { value: retention }
        });
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error("Failed to update data retention:", error);
        return { success: false };
    }
}

// ==========================================
// INTEGRATION SETTINGS
// ==========================================

// Provider mapping for integration names
const PROVIDER_MAP: Record<string, string> = {
    'Jira': 'jira',
    'Slack': 'slack',
    'Microsoft Teams': 'teams',
    'AWS Security Hub': 'aws',
    'ServiceNow': 'servicenow',
    'Splunk': 'splunk',
    'Zendesk': 'zendesk',
    'Email (SMTP)': 'email',
    'CrowdStrike': 'crowdstrike',
    'Carbon Black': 'carbon_black',
    'Tenable': 'tenable',
    'GitHub': 'github',
    'GitLab': 'gitlab'
};

export async function toggleIntegration(name: string, connected: boolean) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { orgId: true, role: true }
        });

        if (!user || !user.orgId) throw new Error("Organization not found");

        // Optimistically update SystemSetting for UI state preference
        const key = `integration_${name.replace(/\s+/g, '_')}`;
        await prisma.systemSetting.upsert({
            where: { userId_key: { userId, key } },
            create: { userId, key, value: String(connected), description: `Integration: ${name}` },
            update: { value: String(connected) }
        });

        // ACTUALLY update the Integration model for Org-wide effect
        const provider = PROVIDER_MAP[name];
        if (provider) {
            const existing = await prisma.integration.findFirst({
                where: { organizationId: user.orgId, provider }
            });

            if (connected) {
                if (existing) {
                    await prisma.integration.update({
                        where: { id: existing.id },
                        data: { status: 'active' }
                    });
                } else {
                    await prisma.integration.create({
                        data: {
                            organizationId: user.orgId,
                            provider,
                            name,
                            status: 'active',
                            config: {}, // Placeholder
                            encryptedCredentials: '', // Placeholder for now
                        }
                    });
                }
            } else {
                if (existing) {
                    await prisma.integration.update({
                        where: { id: existing.id },
                        data: { status: 'inactive' }
                    });
                }
            }
        }

        revalidatePath('/settings');
        revalidatePath('/integrations'); // Also revalidate integrations page
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle integration:", error);
        return { success: false };
    }
}

export async function exportUserData() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // Fetch all user-related data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
            }
        });

        // Fetch user-owned data separately
        const controls = await prisma.control.findMany({ where: { owner: user?.email || '' }, take: 100 });
        const risks = await prisma.risk.findMany({ where: { owner: user?.email || '' }, take: 100 });
        const policies = await prisma.policy.findMany({ where: { owner: user?.email || '' }, take: 100 });
        const vendors = await prisma.vendor.findMany({ where: { owner: user?.email || '' }, take: 100 });
        const evidence = await prisma.evidence.findMany({ where: { uploadedBy: user?.email || '' }, take: 100 });
        const gaps = await prisma.gap.findMany({ where: { owner: user?.email || '' }, take: 100 });
        const audits = await prisma.auditLog.findMany({ where: { userId: userId }, take: 500 });
        const reports = await prisma.report.findMany({ where: { userId: userId }, take: 50 });

        return { success: true, data: { user, controls, risks, policies, vendors, evidence, gaps, audits, reports } };
    } catch (error) {
        console.error("Failed to export data:", error);
        return { success: false, error: "Failed to export data" };
    }
}

// ==========================================
// ACTIVITY LOGS & SESSIONS
// ==========================================

export async function getActivityLogs() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const logs = await prisma.auditLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        return { success: true, logs };
    } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        return { success: false, logs: [] };
    }
}

export async function getSessions() {
    // In a real Clerk app, you'd use Clerk.sessions.getSessionList({ userId })
    // For this implementation, we simulate current session plus a few mock historical ones 
    // to demonstrate the UI "Active Sessions" feature.
    const { userId } = await auth();
    if (!userId) return { success: false, sessions: [] };

    return {
        success: true,
        sessions: [
            {
                id: 'sess_current',
                device: 'Chrome on Windows',
                ipAddress: '192.168.1.1',
                lastActive: new Date().toISOString(),
                isCurrent: true
            },
            {
                id: 'sess_mobile',
                device: 'Safari on iPhone',
                ipAddress: '172.16.0.45',
                lastActive: new Date(Date.now() - 3600000).toISOString(),
                isCurrent: false
            }
        ]
    };
}

// ==========================================
// FULL SETTINGS LOADER
// ==========================================

export async function getUserFullSettings() {
    const { userId } = await auth();
    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                mfaEnabled: true,
                organization: {
                    select: {
                        securitySettings: true
                    }
                }
            }
        });

        const settings = await prisma.systemSetting.findMany({
            where: { userId }
        });

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        // Parse notifications
        const notifications = {
            email: settingsMap['notifications_email'] === 'true',
            marketing: settingsMap['notifications_marketing'] === 'true',
            weeklyDigest: settingsMap['notifications_weeklyDigest'] !== 'false', // Default true
            incidentAlerts: settingsMap['notifications_incidentAlerts'] !== 'false', // Default true
        };

        // Parse compliance
        const compliance = {
            defaultFrameworks: settingsMap['compliance_defaultFrameworks']?.split(',') || ['ISO 27001', 'SOC 2'],
            riskAppetite: settingsMap['compliance_riskAppetite'] || 'medium',
            controlTestingFrequency: settingsMap['compliance_controlTestingFrequency'] || 'quarterly',
            evidenceReviewCycle: parseInt(settingsMap['compliance_evidenceReviewCycle'] || '30'),
        };

        // Security settings
        const security = {
            sessionTimeout: settingsMap['session_timeout'] || '15',
        };

        // Data settings
        const data = {
            retention: settingsMap['data_retention'] || '3years',
        };

        // Integrations
        const integrations: Record<string, boolean> = {};
        Object.keys(settingsMap).forEach(key => {
            if (key.startsWith('integration_')) {
                const name = key.replace('integration_', '');
                integrations[name] = settingsMap[key] === 'true';
            }
        });

        return {
            mfaEnabled: user?.mfaEnabled || false,
            notifications,
            compliance,
            security,
            data,
            integrations,
            organizationSecuritySettings: user?.organization?.securitySettings as any || {
                sessionTtl: 24,
                mfaRequired: false,
                passwordPolicy: 'standard'
            }
        };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}

export async function deleteAccount() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user) return { success: false, error: "User not found" };

        const email = user.email;
        if (!email) return { success: false, error: "User email not found" };

        const userEmail: string = email;

        // Atomic transaction to delete all user data
        await prisma.$transaction([
            prisma.report.deleteMany({ where: { userId } }),
            prisma.control.deleteMany({ where: { owner: userEmail } }),
            prisma.risk.deleteMany({ where: { owner: userEmail } }),
            prisma.policy.deleteMany({ where: { owner: userEmail } }),
            prisma.vendor.deleteMany({ where: { owner: userEmail } }),
            prisma.evidence.deleteMany({ where: { uploadedBy: userEmail } }),
            prisma.action.deleteMany({ where: { owner: userEmail } }),
            prisma.incident.deleteMany({ where: { reportedBy: userEmail } }),
            prisma.change.deleteMany({ where: { requestedBy: userEmail } }),
            prisma.gap.deleteMany({ where: { owner: userEmail } }),
            prisma.auditLog.deleteMany({ where: { userId } }),
            prisma.systemSetting.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } })
        ]);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete account:", error);
        return { success: false, error: "Failed to purge user data" };
    }
}
