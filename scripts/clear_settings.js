const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Clearing SystemSetting table...");
    try {
        await prisma.systemSetting.deleteMany({});
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
