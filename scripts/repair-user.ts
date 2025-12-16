
import { prisma } from '../lib/prisma';

async function main() {
    const email = 'hmamouchmed822@gmail.com';
    console.log(`Refeshing account for: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log('Current State:', { role: user.role, orgId: user.orgId });

    // 1. If Org exists, just promote to Admin
    if (user.orgId) {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' }
        });
        console.log('Updated to Admin.');
    } else {
        // 2. If no Org, create one and promote
        console.log('Creating Org...');
        const newOrg = await prisma.organization.create({
            data: {
                name: `${user.name || 'User'}'s Workspace`,
                plan: 'FREE',
                assessmentLimit: 5,
                users: { connect: { id: user.id } }
            }
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin', orgId: newOrg.id }
        });
        console.log('Created Org and Promoted to Admin.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
