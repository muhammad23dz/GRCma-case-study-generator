
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting migration to Multi-Tenancy (Organization Architecture)...');

    // 1. Create Default Organization if not exists
    let defaultOrg = await prisma.organization.findFirst();

    if (!defaultOrg) {
        console.log('Creating Default Organization...');
        defaultOrg = await prisma.organization.create({
            data: {
                name: 'Default Organization',
                plan: 'ENTERPRISE', // Grant enterprise features to legacy data
                features: JSON.stringify(['all']),
            }
        });
        console.log(`Created Organization: ${defaultOrg.id}`);
    } else {
        console.log(`Using existing Default Organization: ${defaultOrg.id}`);
    }

    const orgId = defaultOrg.id;

    // 2. Migrate Users
    console.log('Migrating Users...');
    const users = await prisma.user.updateMany({
        where: { orgId: null },
        data: { orgId: orgId }
    });
    console.log(`Migrated ${users.count} users.`);

    // 3. Migrate Risks
    console.log('Migrating Risks...');
    const risks = await prisma.risk.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${risks.count} risks.`);

    // 4. Migrate Controls
    console.log('Migrating Controls...');
    const controls = await prisma.control.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${controls.count} controls.`);

    // 5. Migrate Vendors
    console.log('Migrating Vendors...');
    const vendors = await prisma.vendor.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${vendors.count} vendors.`);

    // 6. Migrate Actions
    console.log('Migrating Actions...');
    const actions = await prisma.action.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${actions.count} actions.`);

    // 7. Migrate Policies
    console.log('Migrating Policies...');
    const policies = await prisma.policy.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${policies.count} policies.`);

    // 8. Migrate Incidents
    console.log('Migrating Incidents...');
    const incidents = await prisma.incident.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${incidents.count} incidents.`);

    // 9. Migrate Changes
    console.log('Migrating Changes...');
    const changes = await prisma.change.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${changes.count} changes.`);

    // 10. Migrate Evidence
    console.log('Migrating Evidence...');
    const evidence = await prisma.evidence.updateMany({
        where: { organizationId: null },
        data: { organizationId: orgId }
    });
    console.log(`Migrated ${evidence.count} evidence records.`);

    console.log('Migration Complete! All data is now scoped to Default Organization.');
}

migrate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
