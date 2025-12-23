import { PrismaClient } from '../lib/generated/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'hmamouch.mohamed.b@gmail.com';
    const users = await prisma.user.findMany({
        where: { email }
    });

    console.log(`Users with email ${email}:`, users.length);
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
    });

    const allReports = await prisma.report.findMany({
        where: { user: { email } }
    });
    console.log(`\nReports for email ${email}:`, allReports.length);
    allReports.forEach(r => {
        console.log(`- ID: ${r.id}, UserID: ${r.userId}, Timestamp: ${r.timestamp}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
