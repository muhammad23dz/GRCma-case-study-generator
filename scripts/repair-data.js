/**
 * Data Repair Script - Assigns orphaned GRC entities to the active user
 * Fixes Controls, Risks, Vendors, Actions with null owners
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repairData() {
    console.log('=== DATA REPAIR STARTING ===');

    // Get the admin user email (first user)
    const users = await prisma.user.findMany({ take: 1, orderBy: { id: 'asc' } });
    if (users.length === 0) {
        console.log('No users found. Cannot repair.');
        return;
    }
    const targetEmail = users[0].email;
    console.log(`Target owner email: ${targetEmail}`);

    // Fix Controls
    const controlsFix = await prisma.control.updateMany({
        where: { owner: null },
        data: { owner: targetEmail }
    });
    console.log(`Fixed ${controlsFix.count} Controls`);

    // Fix Risks
    const risksFix = await prisma.risk.updateMany({
        where: { owner: null },
        data: { owner: targetEmail }
    });
    console.log(`Fixed ${risksFix.count} Risks`);

    // Fix Vendors
    const vendorsFix = await prisma.vendor.updateMany({
        where: { owner: null },
        data: { owner: targetEmail }
    });
    console.log(`Fixed ${vendorsFix.count} Vendors`);

    // Fix Actions
    const actionsFix = await prisma.action.updateMany({
        where: { owner: null },
        data: { owner: targetEmail }
    });
    console.log(`Fixed ${actionsFix.count} Actions`);

    // Fix Incidents (reportedBy is required, so check for empty string OR skip)
    // Skip if reportedBy is required non-null, we can't filter by null
    const incidentsWithBadEmail = await prisma.incident.findMany({
        where: { reportedBy: '' }
    });
    if (incidentsWithBadEmail.length > 0) {
        const incidentsFix = await prisma.incident.updateMany({
            where: { reportedBy: '' },
            data: { reportedBy: targetEmail }
        });
        console.log(`Fixed ${incidentsFix.count} Incidents`);
    } else {
        console.log('No Incidents need fixing (reportedBy is required)');
    }

    // Fix Policies
    const policiesFix = await prisma.policy.updateMany({
        where: { owner: null },
        data: { owner: targetEmail }
    });
    console.log(`Fixed ${policiesFix.count} Policies`);

    console.log('=== DATA REPAIR COMPLETE ===');
}

repairData()
    .catch(e => console.error('Repair error:', e))
    .finally(() => prisma.$disconnect());
