import { PrismaClient } from '../lib/generated/client';

const prisma = new PrismaClient();

async function main() {
    const id = 'cmjeok8ym0004gh9owb9mxri8';
    console.log(`Attempting to delete report ${id}...`);

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
        console.log('Report not found before delete.');
        return;
    }

    const deleted = await prisma.report.delete({ where: { id } });
    console.log('Successfully deleted:', deleted.id);

    const check = await prisma.report.findUnique({ where: { id } });
    if (check) {
        console.log('ISSUE: Report still exists after delete!');
    } else {
        console.log('Report successfully removed from DB.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
