/**
 * Check data per user email
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPerUser() {
    console.log('=== DATA PER USER ===\n');

    const users = await prisma.user.findMany({ select: { email: true } });

    for (const user of users) {
        const email = user.email;
        console.log(`USER: ${email}`);
        console.log(`  Controls: ${await prisma.control.count({ where: { owner: email } })}`);
        console.log(`  Risks: ${await prisma.risk.count({ where: { owner: email } })}`);
        console.log(`  Vendors: ${await prisma.vendor.count({ where: { owner: email } })}`);
        console.log(`  Actions: ${await prisma.action.count({ where: { owner: email } })}`);
        console.log(`  Incidents: ${await prisma.incident.count({ where: { reportedBy: email } })}`);
        console.log(`  Policies: ${await prisma.policy.count({ where: { owner: email } })}`);
        console.log(`  Reports: ${await prisma.report.count({ where: { userId: (await prisma.user.findUnique({ where: { email } }))?.id || '' } })}`);
        console.log('---');
    }
}

checkPerUser()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
