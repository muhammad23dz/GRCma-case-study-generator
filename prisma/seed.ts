import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding GRC frameworks...');

    // Create standard frameworks
    const frameworks = [
        {
            name: 'ISO27001',
            version: '2022',
            jurisdiction: 'International',
            description: 'Information security management system standard'
        },
        {
            name: 'NIST_CSF',
            version: '2.0',
            jurisdiction: 'United States',
            description: 'NIST Cybersecurity Framework'
        },
        {
            name: 'SOC2',
            version: '2017',
            jurisdiction: 'United States',
            description: 'Service Organization Control 2'
        },
        {
            name: 'GDPR',
            version: '2018',
            jurisdiction: 'European Union',
            description: 'General Data Protection Regulation'
        },
        {
            name: 'PCI_DSS',
            version: '4.0',
            jurisdiction: 'Global',
            description: 'Payment Card Industry Data Security Standard'
        },
        {
            name: 'HIPAA',
            version: '2013',
            jurisdiction: 'United States',
            description: 'Health Insurance Portability and Accountability Act'
        }
    ];

    for (const framework of frameworks) {
        await prisma.framework.upsert({
            where: { name: framework.name },
            update: framework,
            create: framework
        });
    }

    console.log('✅ Frameworks seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
