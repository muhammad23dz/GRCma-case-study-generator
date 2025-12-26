import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function log(msg: string) {
    try {
        const logPath = path.join(process.cwd(), 'debug.log');
        fs.appendFileSync(logPath, new Date().toISOString() + ': ' + msg + '\n');
    } catch (e) {
        // ignore
    }
}

// GET /api/admin/settings
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        log(`GET Request from userId: ${userId}`);

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch global SMTP settings (not per-user)
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'SMTP_FROM', 'NEXTAUTH_URL', 'APP_URL'] }
            }
        });

        log(`GET Found ${settings.length} global settings`);

        // Mask secrets
        const safeSettings = settings.map(s => ({
            ...s,
            value: s.isSecret ? '********' : s.value
        }));

        return NextResponse.json({ settings: safeSettings });
    } catch (error: any) {
        log(`GET Error: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/settings
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        log(`POST Request from userId: ${userId}`);

        if (!userId) {
            log('POST Unauthorized - Missing userId');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const updates = Array.isArray(body) ? body : [body];

        log(`POST Payload: ${JSON.stringify(updates.map((u: any) => u.key))}`);

        for (const setting of updates) {
            // If value is masked (********), skip update
            if (setting.value === '********') {
                log(`Skipping masked value for ${setting.key}`);
                continue;
            }

            log(`Upserting global setting: ${setting.key}`);

            try {
                // Save as global setting (use key as unique identifier)
                // First try to find existing setting by key
                const existing = await prisma.systemSetting.findFirst({
                    where: { key: setting.key }
                });

                if (existing) {
                    // Update existing setting
                    await prisma.systemSetting.update({
                        where: { id: existing.id },
                        data: {
                            value: setting.value,
                            isSecret: setting.isSecret,
                            description: setting.description
                        }
                    });
                } else {
                    // Create new global setting (with userId for Prisma relation)
                    await prisma.systemSetting.create({
                        data: {
                            userId,
                            key: setting.key,
                            value: setting.value,
                            isSecret: setting.isSecret || false,
                            description: setting.description
                        }
                    });
                }
                log(`Success: ${setting.key}`);
            } catch (innerError: any) {
                log(`Upsert Failed for ${setting.key}: ${innerError.message}`);
                throw innerError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        log(`POST Final Error: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
