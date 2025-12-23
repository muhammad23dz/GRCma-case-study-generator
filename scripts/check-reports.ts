import { PrismaClient } from '../lib/generated/client';

const prisma = new PrismaClient();

async function main() {
    const reports = await prisma.report.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { user: true }
    });

    console.log('Recent Reports:');
    reports.forEach(r => {
        console.log(`- ID: ${r.id}, UserID: ${r.userId}, UserEmail: ${r.user?.email}, Timestamp: ${r.timestamp}`);
    });

    const users = await prisma.user.findMany({
        take: 10
    });

    console.log('\nRecent Users:');
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
