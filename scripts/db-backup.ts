
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function backup() {
    console.log('Starting database backup...');

    const data: Record<string, any[]> = {};

    // List of models to backup (order matters for restoration, but for backup just grabbing all)
    // We will handle dependency order during restore
    const models = [
        'organization',
        'user',
        'account',
        'session',
        'systemSetting',
        'report',
        'framework',
        'frameworkRequirement',
        'control',
        'frameworkMapping',
        'risk',
        'vendor',
        'vendorAssessment',
        'evidence',
        'attestation',
        'playbook',
        'riskControl',
        'incident',
        'incidentRisk',
        'vendorRisk',
        'action',
        'policy',
        'change',
        'changeApproval',
        'changeTask',
        'changeRisk',
        'changeImpact',
        'changeComment',
        'changeAttachment',
        'cABMember',
        'trustRequest',
        'lLMUsage',
        'subscription',
        'transaction'
    ];

    for (const model of models) {
        try {
            // @ts-ignore - Dynamic access
            const records = await prisma[model].findMany();
            data[model] = records;
            console.log(`Backed up ${records.length} records for ${model}`);
        } catch (e: any) {
            console.warn(`Skipping model ${model} (or error):`, e.message);
        }
    }

    const backupDir = path.join(process.cwd(), 'backup');
    try {
        await fs.mkdir(backupDir, { recursive: true });
    } catch (e) { }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(backupDir, `backup-${timestamp}.json`);
    const latestFilename = path.join(backupDir, 'latest-backup.json');

    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    await fs.writeFile(latestFilename, JSON.stringify(data, null, 2));

    console.log(`\nBackup completed successfully! Saved to:`);
    console.log(`- ${filename}`);
    console.log(`- ${latestFilename}`);
}

backup()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
