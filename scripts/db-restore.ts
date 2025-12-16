
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Fields that will be converted from String to JSON Object during restore
const JSON_FIELDS: Record<string, string[]> = {
    Organization: ['features'],
    Report: ['sections'],
    Control: ['llmProvenance'],
    Risk: ['drivers', 'recommendedActions', 'llmProvenance'],
    VendorAssessment: ['questionsAsked', 'questionsAnswered'],
    Action: ['playbook'],
    Playbook: ['steps'],
    Change: ['affectedSystems'],
    CABMember: ['expertise'],
};

// safely parse JSON if it's a string, otherwise return as is
function safeParse(val: any) {
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (e) {
            return val; // Keep as string if parse fails (fallback)
        }
    }
    return val;
}

async function restore() {
    console.log('Starting database restore...');

    const backupPath = path.join(process.cwd(), 'backup', 'latest-backup.json');
    const fileContent = await fs.readFile(backupPath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Restore Order (Topological Sort)
    const models = [
        'organization',
        'user',
        'framework',
        // 'frameworkRequirement', // depends on framework
        // 'control', // depends on org
        // ... we rely on the loop sequence we define here
    ];

    // Implicitly, we iterate through the known safe order:
    const order = [
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
        'evidence', // depends on control
        'vendor',
        'vendorAssessment',
        'risk',
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
        'transaction',
        'playbook',
        'attestation'
    ];

    for (const modelName of order) {
        if (!data[modelName] || data[modelName].length === 0) {
            console.log(`Skipping ${modelName} (No data)`);
            continue;
        }

        console.log(`Restoring ${data[modelName].length} records for ${modelName}...`);

        // Capitalized key for JSON_FIELDS lookup
        const pascalModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
        const jsonFields = JSON_FIELDS[pascalModelName] || [];

        for (const record of data[modelName]) {
            // Transform fields
            const formattedRecord = { ...record };

            jsonFields.forEach(field => {
                if (formattedRecord[field]) {
                    formattedRecord[field] = safeParse(formattedRecord[field]);
                }
            });

            // Remove foreign keys if null (Prisma can be strict) - though usually fine
            // Handle Date conversion if strings

            try {
                // @ts-ignore
                await prisma[modelName].create({
                    data: formattedRecord
                });
            } catch (e: any) {
                // If strict mode on ID, maybe we should update?
                // Let's try upsert if create fails? 
                // Actually, cleaner to allow fail on duplicate if we assume empty DB, 
                // but for now let's just log warning.
                if (e.code === 'P2002') {
                    // Unique constraint failed, maybe already exists
                    // ignore
                } else {
                    console.error(`Failed to insert ${modelName} ${record.id}:`, e.message);
                }
            }
        }
    }

    console.log('\nRestore completed.');
}

restore()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
