
import { prisma } from '../lib/prisma';

async function main() {
    console.log('⚠️ STARTING FULL DATABASE WIPE (Auth & Tenants) ⚠️');

    // 1. Delete Dependencies first (Auth)
    console.log('...Deleting Sessions');
    await prisma.session.deleteMany({});

    console.log('...Deleting Accounts');
    await prisma.account.deleteMany({});

    console.log('...Deleting Invitations');
    await prisma.invitation.deleteMany({});

    console.log('...Deleting VerificationTokens');
    await prisma.verificationToken.deleteMany({});

    // 2. Delete Users (Cascades to Reports, Settings, etc.)
    console.log('...Deleting Users');
    // We might need to handle circular dependencies if any, but usually User is leaf for Org.
    await prisma.user.deleteMany({});

    // 3. Delete Organizations (Now empty of users)
    console.log('...Deleting Organizations');
    await prisma.organization.deleteMany({});

    // 4. Cleanup Misc
    console.log('...Deleting Audit Logs & Trust Requests');
    // Using try-catch for tables that might not exist in all migrations yet
    try { await prisma.auditLog.deleteMany({}); } catch (e) { }
    try { await prisma.trustRequest.deleteMany({}); } catch (e) { }

    console.log('✅ DATABASE WIPED SUCCESSFULLY.');
    console.log('Next login will auto-provision new Tenant & Admin Role.');
}

main()
    .catch((e) => {
        console.error('❌ Reset Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
