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

        return { success: true, data: { user, controls, risks, policies, vendors, evidence } };
    } catch (error) {
        console.error("Failed to export data:", error);
        return { success: false, error: "Failed to export data" };
    }
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
            select: { mfaEnabled: true }
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

        return {
            mfaEnabled: user?.mfaEnabled || false,
            notifications,
            compliance,
            security,
            data,
        };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return null;
    }
}
