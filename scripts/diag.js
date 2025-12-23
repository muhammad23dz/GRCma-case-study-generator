const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('=== DEEP DIAGNOSTIC ===');

    // 1. Check Users
    console.log('\n[USERS]');
    const users = await prisma.user.findMany({ include: { accounts: true } });
    if (users.length === 0) console.log('  NO USERS FOUND IN DB!');
    users.forEach(u => {
        console.log(`  ID: ${u.id}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Role: ${u.role}`);
        console.log(`  OrgId: ${u.orgId}`);
        console.log(`  Accounts: ${u.accounts.length}`);
        console.log('  ---');
    });

    // 2. Check Reports
    console.log('\n[REPORTS]');
    const reports = await prisma.report.findMany();
    if (reports.length === 0) console.log('  NO REPORTS FOUND!');
    reports.forEach(r => {
        console.log(`  Report ID: ${r.id}, Linked UserID: ${r.userId}, Timestamp: ${r.timestamp}`);
    });

    // 3. Check Controls (Ownership)
    console.log('\n[CONTROLS (Sample)]');
    const controls = await prisma.control.findMany({ take: 5 });
    if (controls.length === 0) console.log('  NO CONTROLS FOUND!');
    controls.forEach(c => {
        console.log(`  Control ID: ${c.id}, Owner: ${c.owner}, Title: ${c.title}`);
    });

    // 4. Check Risks
    const riskCount = await prisma.risk.count();
    console.log(`\nTOTAL RISKS: ${riskCount}`);

    // 5. Check Actions
    const actionCount = await prisma.action.count();
    console.log(`TOTAL ACTIONS: ${actionCount}`);
}

main()
    .catch((e) => {
        console.error('DIAG ERROR:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
